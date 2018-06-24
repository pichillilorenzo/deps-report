// @flow

const typescript = require('typescript'),
  fs = require('fs'),
  path = require('path')

function flowTraverseAST(key/*: string*/, values/*: Array<any>*/, doc/* : Object*/, wild/*: boolean*/=false, return_parent/*: Object | boolean*/=false, results/*: Array<any>*/=[])/*: Array<any>*/{

  if (doc) {
    if (Array.isArray(doc)) {
      for (let d of doc) {
        flowTraverseAST(key, values, d, wild, (return_parent) ? doc : false, results)
      }
    }

    if (!Array.isArray(doc) && typeof doc == "object"){
      for (let k in doc) {
        let v = doc[k]
        if ( values && values.indexOf(v) >= 0 && ( key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) ) {
          results.push((!return_parent) ? doc : return_parent)
        }
        else if (!values && key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) {
          results.push((!return_parent) ? doc : return_parent)
        }
        else if (!Array.isArray(v)) {
          flowTraverseAST(key, values, v, wild, (return_parent) ? doc : false, results)
        }
        else if (Array.isArray(v)) {
          for (let d of v) {
            flowTraverseAST(key, values, d, wild, (return_parent) ? doc : false, results)
          }
        }
      }
    }
  }

  return results
}

function typescriptTraverseAST(key/*: string*/, values/*: Array<any>*/, doc/* : Object*/, wild/*: boolean*/=false, return_parent/*: Object | boolean*/=false, results/*: Array<any>*/=[])/*: Array<any>*/{

  if (doc) {
    for (let k in doc) {
      let v = doc[k]
      if ( values && values.indexOf(v) >= 0 && ( key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) ) {
        results.push((!return_parent) ? doc : return_parent)
      }
      else if (!values && key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) {
        results.push((!return_parent) ? doc : return_parent)
      }
    }  

    typescript.forEachChild(doc, (node) => {typescriptTraverseAST(key, values, node, wild, (return_parent) ? doc : false, results)})
  }

  return results
}

function webpackAliasResolver(mod/*: string */, webpackConfigFile/*: string*/)/*: {webpackConfig: {}, isWebpackError: boolean, keepRelative: boolean, module: string, moduleAbsPath: string}*/ {
  let result = {
    webpackConfig: {}, 
    isWebpackError: false, 
    keepRelative: false,
    module: mod,
    moduleAbsPath: ''
  }

  if (!fs.existsSync(webpackConfigFile)) {
    throw new Error(webpackConfigFile + ' webpack config file doesn\'t exists.')
  }

  // $FlowFixMe
  result.webpackConfig = require(path.resolve(webpackConfigFile))

  if (result.webpackConfig.resolve && result.webpackConfig.resolve.alias) {
    for (let alias /*: string*/ in result.webpackConfig.resolve.alias) {
      let modulePath /*: string*/ = result.webpackConfig.resolve.alias[alias]
      let normalizedAliasName = (alias[alias.length - 1] == "$") ? alias.substring(0, alias.length - 1) : alias 
      let isExactMatch = mod == alias.substring(0, alias.length - 1)
      
      if (isExactMatch || mod == alias || (mod+path.sep).indexOf(normalizedAliasName+path.sep) >= 0 ) {
        result.moduleAbsPath = path.normalize(mod.replace(normalizedAliasName, modulePath))
        if (mod == alias && path.extname(modulePath)) {
          result.keepRelative = true
        }

        // check if alias resolver results in an error
        if (path.extname(path.parse(result.moduleAbsPath).dir)) {
          result.isWebpackError = true
          break
        }

        if (fs.existsSync(result.moduleAbsPath) && fs.lstatSync(result.moduleAbsPath).isDirectory()) {
          // points to main attribute of package.json, default is index.js
          let mainModuleExported = 'index.js'
          let packageJsonDependency = path.join(result.moduleAbsPath, 'package.json')
          packageJsonDependency = (fs.existsSync(packageJsonDependency)) ? JSON.parse(fs.readFileSync(packageJsonDependency, 'utf8')) : null
          if (packageJsonDependency && packageJsonDependency.main) {
            mainModuleExported = packageJsonDependency.main
          }
          result.moduleAbsPath = path.join(result.moduleAbsPath, mainModuleExported)
          result.module = path.join(mod, mainModuleExported)
        }
        break
      }

    }
  }

  return result
}

module.exports = {
  flowTraverseAST,
  typescriptTraverseAST,
  webpackAliasResolver
}