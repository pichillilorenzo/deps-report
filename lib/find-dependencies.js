// @flow

const util = require("./util.js"),
  path = require("path"),
  fs = require("fs"),
  typescript = require("typescript"),
  flowParser = require('flow-parser')

function findDependencies(inputFile/*: string*/, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean} }*/){

  let data = fs.readFileSync(inputFile, {encoding: 'utf8'})
      
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
      let dependencyExt = path.extname(dependency)
      if (!dependencyExt) {
        let dependencyAbsPath = path.resolve(path.join(path.dirname(inputFile), dependency))
        if (isTS && fs.existsSync(dependencyAbsPath + '.ts'))
          dependency = dependency + '.ts'
        else if (fs.existsSync(dependencyAbsPath + '.js'))
          dependency = dependency + '.js'
      }

      if (dependency.startsWith(".") || dependency.startsWith("/") || dependency.startsWith(":", 1) || dependency.endsWith(".js"))
        dependencies.push( (options.parent.absPath) ? path.resolve(path.join(path.dirname(inputFile), dependency)) : dependency )
      else if (!options.parent.excludeNodeModules) 
        dependencies.push(dependency)
    }
  }

  return dependencies
}

module.exports = findDependencies