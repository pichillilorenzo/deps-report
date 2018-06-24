// @flow

const util = require("./util.js"),
  path = require("path"),
  fs = require("fs"),
  globby = require("globby"),
  typescript = require("typescript"),
  flowParser = require('flow-parser')

function findDependencies(globs/*: Array<string>*/, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string} }*/)/*: Object*/{

  let inputFiles /*: Array<string>*/= globby.sync(globs)
  let result = {}

  for (let inputFile of inputFiles) {
    
    let data = fs.readFileSync(inputFile, 'utf8')
        
    let ast = {}
    let imports = []
    let dependencies = []
    let isTS = false

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
        path: '',
        absolutePath: '',
        isNodeModule: false,
        specifiers: []
      }

      if (isTS) {
        if (imp.kind == typescript.SyntaxKind.VariableDeclaration && 
          imp.initializer && 
          imp.initializer.expression &&
          imp.initializer.expression.escapedText == "require") 
        {
          dependency.path = imp.initializer.arguments[0].text
          if (imp.name) {
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
        else if (imp.kind == typescript.SyntaxKind.ImportDeclaration) {
          dependency.path = imp.moduleSpecifier.text
          if (imp.importClause) {
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
        if (imp.type == 'VariableDeclarator' && 
          imp.init && 
          imp.init.type == "CallExpression" &&
          imp.init.callee.name == "require") 
        {
          dependency.path = imp.init.arguments[0].value
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
        else if (imp.type == 'ImportDeclaration') {
          dependency.path = imp.source.value
          for (let specifier /*: Object*/ of imp.specifiers) {
            dependency.specifiers.push({
              name: (specifier.imported) ? specifier.imported.name : specifier.local.name,
              alias: (specifier.imported && specifier.imported.name != specifier.local.name) ? specifier.local.name : '',
              isDefault: specifier.type == 'ImportDefaultSpecifier'
            })
          }
        }
      }

      if (dependency.path) {

        let webpackAliasResolved = {}

        if (options.parent.webpackConfig) {
          webpackAliasResolved = util.webpackAliasResolver(dependency.path, options.parent.webpackConfig)
          dependency.path = webpackAliasResolved.module
          dependency.absolutePath = webpackAliasResolved.moduleAbsPath
        }

        if (webpackAliasResolved.isWebpackError)
          continue

        dependency.absolutePath = (!dependency.absolutePath) ? path.resolve(path.join(path.dirname(inputFile), dependency.path)) : dependency.absolutePath
  
        if (!path.extname(dependency.absolutePath)) {
          if ( isTS && fs.existsSync( dependency.absolutePath + '.ts' ) ) {
            dependency.absolutePath += '.ts'
          }
          else if (fs.existsSync(dependency.absolutePath + '.js')) {
            dependency.absolutePath += '.js'
          }
          if (!webpackAliasResolved.keepRelative && !path.extname(dependency.path) && fs.existsSync(dependency.absolutePath) )
            dependency.path += path.extname(dependency.absolutePath)
        }

        if ( (dependency.absolutePath.indexOf("node_modules") == -1 && fs.existsSync(dependency.absolutePath)) ) {
          dependencies.push(dependency)
        }
        else if ((dependency.absolutePath.indexOf("node_modules") >= 0 || !fs.existsSync(dependency.absolutePath)) && !options.parent.excludeNodeModules) {
          dependency.isNodeModule = true
          dependency.absolutePath = ""
          dependencies.push(dependency)
        }

      }
    }
    if (dependencies) {
      result[inputFile] = {
        absolutePath: path.resolve(inputFile),
        files: dependencies.length,
        dependencies
      }
    }
  }
  return result
}

module.exports = findDependencies