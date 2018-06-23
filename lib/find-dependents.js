// @flow

const util = require("./util.js"),
  path = require("path"),
  fs = require("fs"),
  globby = require("globby"),
  typescript = require("typescript"),
  flowParser = require('flow-parser')

function findDependents(inputFile/*: string*/, options/*: {root: string, parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean} }*/){
  let dependents = []
  const dirname = (!options.root) ? path.dirname(inputFile) : options.root
  const baseName = path.basename(inputFile)
  const baseNameNoExt = path.basename(inputFile, path.extname(inputFile))
  const absPath = path.resolve(inputFile)
  const isTS = baseName.endsWith(".ts")
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

    // Don't consider js files where there is no import/require of inputFile
    if (data.indexOf(baseName+'\"') == -1 && data.indexOf(baseNameNoExt+'\"') == -1 &&
      data.indexOf(baseName+'\'') == -1 && data.indexOf(baseNameNoExt+'\'') == -1 &&
      data.indexOf(baseName+'\`') == -1 && data.indexOf(baseNameNoExt+'\`') == -1) {
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
      let dependent = ""

      if (isEntryTS) {
        if (imp.kind == typescript.SyntaxKind.VariableDeclaration && 
          imp.initializer && 
          imp.initializer.expression &&
          imp.initializer.expression.escapedText == "require") 
        {
          dependent = imp.initializer.arguments[0].text
        }
        else if (imp.kind == typescript.SyntaxKind.ImportDeclaration) {
          dependent = imp.moduleSpecifier.text
        }
      }
      else {
        if (imp.type == 'VariableDeclarator' && 
          imp.init && 
          imp.init.type == "CallExpression" &&
          imp.init.callee.name == "require") 
        {
          dependent = imp.init.arguments[0].value
        }
        else if (imp.type == 'ImportDeclaration') {
          dependent = imp.source.value
        }
      }
      let dependentAbsPath = path.resolve(path.join(path.dirname(entry), dependent))
      dependentAbsPath = (dependentAbsPath.endsWith( (isTS) ? '.ts' : '.js' ) ) ? dependentAbsPath : (dependentAbsPath.replace(/(\.js|\.ts)/, '') + ((isTS) ? '.ts' : '.js'))
      if (!fs.existsSync(dependentAbsPath))
        continue

      if (dependent &&
        ( dependent.startsWith(".") || dependent.startsWith("/") || dependent.startsWith(":", 1) ) &&
        ( dependentAbsPath == absPath) &&
        ( dependent.endsWith(path.basename(inputFile)) || dependent.endsWith(baseNameNoExt) ) )
      {
        dependents.push( (options.parent.absPath) ? path.resolve(entry) : entry )
        break
      }
    }
      
  }

  return dependents
}

module.exports = findDependents