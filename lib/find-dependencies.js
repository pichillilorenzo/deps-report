// @flow

const util = require("./util.js"),
  path = require("path"),
  fs = require("fs"),
  globby = require("globby"),
  typescript = require("typescript"),
  flowParser = require('flow-parser')

function findDependencies(globs/*: Array<string>*/, options/*: FindDependenciesCommandOptions*/)/*: Object*/{

  let inputFiles /*: Array<string>*/= globby.sync(globs)
  let result = {}

  for (let inputFile of inputFiles) {

    let absPathInputFile = path.resolve(inputFile)
    let data = fs.readFileSync(inputFile, 'utf8')
        
    let ast = {}
    let imports = []
    let dependencies = []
    let isTS = false
    let hasNoDependency = true

    // initialize result
    result[inputFile] = {
      absolutePath: absPathInputFile,
      files: dependencies.length,
      dependencies
    }

    // Apply a first filter to exclude some files:
    // Don't consider js files where there is no import/require of inputFile
    if ( data.indexOf('require(') == -1 && data.indexOf('import ') == -1  )
      continue 

    if (inputFile.trim().endsWith(".ts")) {
      isTS = true
      ast = typescript.createSourceFile(inputFile, data)
      imports = util.typescriptTraverseAST('kind', [typescript.SyntaxKind.VariableDeclaration, typescript.SyntaxKind.ImportDeclaration], ast)
    }
    else {
      ast = flowParser.parse(data)
      imports = util.flowTraverseAST('type', ['VariableDeclarator', 'ImportDeclaration'], ast)
    }

    for (let imp /*: Object*/ of imports) {
      let dependency = {
        importPath: '',
        importAbsolutePath: '',
        isCircularDependency: null,
        isNodeModule: false,
        specifiers: []
      }

      if (isTS) {
        if ( util.isRequireStatement(imp, true) ) {
          dependency.importPath = imp.initializer.arguments[0].text
          if (options.parent.specifiers && imp.name) {
            if (imp.name.kind == typescript.SyntaxKind.Identifier) {
              dependency.specifiers.push({
                name: imp.name.escapedText,
                alias: '',
                isDefault: true
              })
            }
            else if (imp.name.kind == typescript.SyntaxKind.ObjectBindingPattern) {
              for (let element /*: Object*/ of imp.name.elements) {
                dependency.specifiers.push({
                  name: element.name.escapedText,
                  alias: '',
                  isDefault: false
                })
              }
            }
          }
        }
        else if ( util.isImportStatement(imp, true) ) {
          dependency.importPath = imp.moduleSpecifier.text
          if (options.parent.specifiers && imp.importClause) {
            if (imp.importClause.name) {
              dependency.specifiers.push({
                name: imp.importClause.name.escapedText,
                alias: '',
                isDefault: true
              })
            }
            if (imp.importClause.namedBindings) {
              for (let element /*: Object*/ of imp.importClause.namedBindings.elements) {
                dependency.specifiers.push({
                  name: (element.propertyName) ? element.propertyName.escapedText : element.name.escapedText,
                  alias: (element.propertyName) ? element.name.escapedText : '',
                  isDefault: false
                })
              }
            }
          }
        }
      }
      else {
        if ( util.isRequireStatement(imp, false) ) {
          dependency.importPath = imp.init.arguments[0].value
          if (imp.id) {
            if (imp.id.type == 'Identifier') {
              dependency.specifiers.push({
                name: imp.id.name,
                alias: '',
                isDefault: true
              })
            }
            else if (imp.id.type == 'ObjectPattern') {
              for (let property /*: Object*/ of imp.id.properties) {
                dependency.specifiers.push({
                  name: property.key.name,
                  alias: '',
                  isDefault: false
                })
              }
            }
          }
        }
        else if ( util.isImportStatement(imp, false) ) {
          dependency.importPath = imp.source.value
          for (let specifier /*: Object*/ of imp.specifiers) {
            dependency.specifiers.push({
              name: (specifier.imported) ? specifier.imported.name : specifier.local.name,
              alias: (specifier.imported && specifier.imported.name != specifier.local.name) ? specifier.local.name : '',
              isDefault: specifier.type == 'ImportDefaultSpecifier'
            })
          }
        }
      }

      if (dependency.importPath) {
        let webpackAliasResolved = {}

        if (options.parent.webpackConfig) {
          webpackAliasResolved = util.webpackAliasResolver(dependency.importPath, options.parent.webpackConfig)
          dependency.importPath = webpackAliasResolved.module
          dependency.importAbsolutePath = webpackAliasResolved.moduleAbsPath
        }

        if (webpackAliasResolved.isWebpackError)
          continue

        dependency.importAbsolutePath = (!dependency.importAbsolutePath) ? path.resolve(path.join(path.dirname(inputFile), dependency.importPath)) : dependency.importAbsolutePath

        if ( !path.extname(dependency.importAbsolutePath) || !fs.existsSync(dependency.importAbsolutePath) ) {
          if ( isTS && fs.existsSync( dependency.importAbsolutePath + '.ts' ) ) {
            dependency.importAbsolutePath += '.ts'
          }
          else if (fs.existsSync(dependency.importAbsolutePath + '.js')) {
            dependency.importAbsolutePath += '.js'
          }
          else if ( !isTS && fs.existsSync( dependency.importAbsolutePath + '.ts' ) ) {
            // importing .ts file in .js file is an error, so skip it
            continue
          }

          if (!webpackAliasResolved.keepRelative && !path.extname(dependency.importPath) && fs.existsSync(dependency.importAbsolutePath) )
            dependency.importPath += path.extname(dependency.importAbsolutePath)
        }

        if ( (dependency.importAbsolutePath.indexOf("node_modules") == -1 && fs.existsSync(dependency.importAbsolutePath)) ) {
          if (options.circular || options.onlyCircular)
            dependency.isCircularDependency = isCircularDependency(dependency.importAbsolutePath, absPathInputFile, options)

          if (options.onlyCircular && dependency.isCircularDependency) {
            if (options.onlyNotFound) {
              hasNoDependency = false
              break
            }
            dependencies.push(dependency)
          }
          else if (!options.onlyCircular) {
            if (options.onlyNotFound) {
              hasNoDependency = false
              break
            }
            dependencies.push(dependency)
          }
        }
        else if ( !options.onlyCircular && ((dependency.importAbsolutePath.indexOf("node_modules") >= 0 || !fs.existsSync(dependency.importAbsolutePath)) && !options.parent.excludeNodeModules) ) {
          if (options.onlyNotFound) {
            hasNoDependency = false
            break
          }
          dependency.isNodeModule = true
          dependency.importAbsolutePath = dependency.importPath
          dependencies.push(dependency)
        }
      }
    }

    if (options.onlyNotFound && !hasNoDependency) {
      delete result[inputFile]
      continue
    }

    result[inputFile] = {
      absolutePath: absPathInputFile,
      files: dependencies.length,
      dependencies
    }

  }
  return result
}

function isCircularDependency(mod/*: string */, absolutePath/*: string */, options/*: FindDependenciesCommandOptions*/)/*: boolean */ {
  // clone
  let opts = Object.assign({}, options)
  opts.circular = false
  opts.onlyCircular = false
  const deps = findDependencies([mod], opts)

  for (let dependency of deps[mod].dependencies) {
    if (dependency.importAbsolutePath == absolutePath) {
      return true
    }
  }

  return false
}

module.exports = findDependencies