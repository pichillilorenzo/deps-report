// @flow

const util = require("./util.js"),
  path = require("path"),
  fs = require("fs"),
  globby = require("globby"),
  typescript = require("typescript"),
  flowParser = require('flow-parser')

function findDependents(globs/*: Array<string>*/, options/*: FindDependentsCommandOptions*/)/*: Object*/{

  let inputFiles /*: Array<string>*/= globby.sync(globs)
  let result = {}

  for (let inputFile of inputFiles) {
    let dependents = []
    const dirname = (!options.root) ? path.dirname(inputFile) : options.root
    const baseName = path.basename(inputFile)
    const baseNameNoExt = path.basename(inputFile, path.extname(inputFile))
    const absPath = path.resolve(inputFile)
    const isTS = baseName.endsWith(".ts")
    let aliasName = ""
    if (options.parent.webpackConfig) {
      aliasName = util.webpackFindAlias(inputFile, options.parent.webpackConfig)
    }
    const entries = globby.sync([
      path.join(dirname, "**", "*.js"),
      path.join(dirname, "**", "*.ts"), 
      "!"+inputFile,
      "!"+path.join(dirname, "**", "*.spec.js"), 
      "!"+path.join(dirname, "**", "*.d.ts"),
      "!"+path.join("node_modules", "**", "*"),
    ])
    
    for (let entry of entries) {
      
      let data /*: string */ = fs.readFileSync(entry, 'utf8')
      
      // Apply a first filter to exclude some files:
      // Don't consider js files where there is no import/require of inputFile
      if ( data.indexOf('require(') == -1 && data.indexOf('import ')  == -1 && 
        (data.indexOf(baseName+'\"') == -1 && data.indexOf(baseNameNoExt+'\"') == -1 &&
        data.indexOf(baseName+'\'') == -1 && data.indexOf(baseNameNoExt+'\'') == -1 &&
        data.indexOf(baseName+'\`') == -1 && data.indexOf(baseNameNoExt+'\`') == -1) && 
        (aliasName && (data.indexOf('\"'+aliasName) == -1 &&
        data.indexOf('\''+aliasName) == -1 &&
        data.indexOf('\`'+aliasName) == -1)) ) {
        continue 
      }

      let ast = {}
      let imports = []
      let isEntryTS = false

      if (entry.trim().endsWith(".ts")) {
        isEntryTS = true
        try {
          ast = typescript.createSourceFile(inputFile, data)
        } catch(e) {
          console.log(e)
          continue
        }
        imports = util.typescriptTraverseAST('kind', [typescript.SyntaxKind.VariableDeclaration, typescript.SyntaxKind.ImportDeclaration], ast)
      }
      else {
        try {
          ast = ast = flowParser.parse(data)
        } catch(e) {
          console.log(e)
          continue
        }
        imports = util.flowTraverseAST('type', ['VariableDeclarator', 'ImportDeclaration'], ast)
      }

      for (let imp /*: Object*/ of imports) {
        let dependent = {
          filePath: entry,
          fileAbsolutePath: path.resolve(entry),
          importPath: '',
          importAbsolutePath: '',
          specifiers: []
        }

        if (isEntryTS) {
          if ( util.isRequireStatement(imp, true) ) {
            dependent.importPath = imp.initializer.arguments[0].text
            if (imp.name) {
              if (imp.name.kind == typescript.SyntaxKind.Identifier) {
                dependent.specifiers.push({
                  name: imp.name.escapedText,
                  alias: '',
                  isDefault: true
                })
              }
              else if (imp.name.kind == typescript.SyntaxKind.ObjectBindingPattern) {
                for (let element /*: Object*/ of imp.name.elements) {
                  dependent.specifiers.push({
                    name: element.name.escapedText,
                    alias: '',
                    isDefault: false
                  })
                }
              }
            }
          }
          else if ( util.isImportStatement(imp, true) ) {
            dependent.importPath = imp.moduleSpecifier.text
            if (imp.importClause) {
              if (imp.importClause.name) {
                dependent.specifiers.push({
                  name: imp.importClause.name.escapedText,
                  alias: '',
                  isDefault: true
                })
              }
              if (imp.importClause.namedBindings) {
                for (let element /*: Object*/ of imp.importClause.namedBindings.elements) {
                  dependent.specifiers.push({
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
            dependent.importPath = imp.init.arguments[0].value
            if (imp.id) {
              if (imp.id.type == 'Identifier') {
                dependent.specifiers.push({
                  name: imp.id.name,
                  alias: '',
                  isDefault: true
                })
              }
              else if (imp.id.type == 'ObjectPattern') {
                for (let property /*: Object*/ of imp.id.properties) {
                  dependent.specifiers.push({
                    name: property.key.name,
                    alias: '',
                    isDefault: false
                  })
                }
              }
            }
          }
          else if ( util.isImportStatement(imp, false) ) {
            dependent.importPath = imp.source.value
            for (let specifier /*: Object*/ of imp.specifiers) {
              dependent.specifiers.push({
                name: (specifier.imported) ? specifier.imported.name : specifier.local.name,
                alias: (specifier.imported && specifier.imported.name != specifier.local.name) ? specifier.local.name : '',
                isDefault: specifier.type == 'ImportDefaultSpecifier'
              })
            }
          }
        }

        if (dependent.importPath) {
          let webpackAliasResolved = {}

          if (options.parent.webpackConfig) {
            webpackAliasResolved = util.webpackAliasResolver(dependent.importPath, options.parent.webpackConfig)
            dependent.importPath = webpackAliasResolved.module
            dependent.importAbsolutePath = webpackAliasResolved.moduleAbsPath
          }

          if (webpackAliasResolved.isWebpackError)
            continue

          dependent.importAbsolutePath = (!dependent.importAbsolutePath) ? path.resolve(path.join(path.dirname(entry), dependent.importPath)) : dependent.importAbsolutePath

          if (!path.extname(dependent.importAbsolutePath)) {
            if ( isTS && fs.existsSync( dependent.importAbsolutePath + '.ts' ) ) {
              dependent.importAbsolutePath += '.ts'
            }
            else if (fs.existsSync(dependent.importAbsolutePath + '.js')) {
              dependent.importAbsolutePath += '.js'
            }
            if (!webpackAliasResolved.keepRelative && !path.extname(dependent.importPath) && fs.existsSync(dependent.importAbsolutePath) )
              dependent.importPath += path.extname(dependent.importAbsolutePath)
          }
        }

        if (dependent.importAbsolutePath == absPath) {
          dependents.push(dependent)
          break
        }
      }
        
    }
    if (dependents) {
      result[inputFile] = {
        absolutePath: path.resolve(inputFile),
        files: dependents.length,
        dependents
      }
    }
  }
  return result
}

module.exports = findDependents