// @flow

const util = require("./util.js"),
  path = require("path"),
  fs = require("fs"),
  typescript = require("typescript"),
  flowParser = require('flow-parser')

function findDependencies(inputFile/*: string*/, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string} }*/){

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
    let dependency = ""
    let dependencyExt = ""
    let dependencyAbsPath = ""
    let dependencyAbsPathExt = ""

    if (isTS) {
      if (imp.kind == typescript.SyntaxKind.VariableDeclaration && 
        imp.initializer && 
        imp.initializer.expression &&
        imp.initializer.expression.escapedText == "require") 
      {
        dependency = imp.initializer.arguments[0].text
      }
      else if (imp.kind == typescript.SyntaxKind.ImportDeclaration) {
        dependency = imp.moduleSpecifier.text
      }
    }
    else {
      if (imp.type == 'VariableDeclarator' && 
        imp.init && 
        imp.init.type == "CallExpression" &&
        imp.init.callee.name == "require") 
      {
        dependency = imp.init.arguments[0].value
      }
      else if (imp.type == 'ImportDeclaration') {
        dependency = imp.source.value
      }
    }

    if (dependency) {

      let webpackAliasResolved = {}

      if (options.parent.webpackConfig) {
        webpackAliasResolved = util.webpackAliasResolver(dependency, options.parent.webpackConfig)
        dependency = webpackAliasResolved.module
        dependencyAbsPath = webpackAliasResolved.moduleAbsPath
      }

      if (webpackAliasResolved.isWebpackError)
        continue

      dependencyAbsPath = (!dependencyAbsPath) ? path.resolve(path.join(path.dirname(inputFile), dependency)) : dependencyAbsPath
      dependencyAbsPathExt = path.extname(dependencyAbsPath)
      if (!dependencyAbsPathExt) {
        if ( isTS && fs.existsSync( dependencyAbsPath + '.ts' ) ) {
          dependencyAbsPath += '.ts'
          dependencyAbsPathExt = 'ts'
        }
        else if (fs.existsSync(dependencyAbsPath + '.js')) {
          dependencyAbsPath += '.js'
          dependencyAbsPathExt = 'js'
        }
      }

      dependencyExt = path.extname(dependency)
      if (!webpackAliasResolved.keepRelative && !dependencyExt) {
        if ( isTS && dependencyAbsPathExt == 'ts' && fs.existsSync(dependencyAbsPath) ) {
          dependency += '.ts'
          dependencyExt = 'ts'
        }
        else if (dependencyAbsPathExt == 'js' && fs.existsSync(dependencyAbsPath)) {
          dependency += '.js'
          dependencyExt = 'js'
        }
      }

      if (dependencyAbsPath.indexOf("node_modules") == -1 && fs.existsSync(dependencyAbsPath))
        dependencies.push( (options.parent.absPath) ? dependencyAbsPath : dependency )
      else if ((dependencyAbsPath.indexOf("node_modules") >= 0 || !fs.existsSync(dependencyAbsPath)) && !options.parent.excludeNodeModules) 
        dependencies.push(dependency)
    }
  }
  return dependencies
}

module.exports = findDependencies