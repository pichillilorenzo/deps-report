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
      let aliasAbsPath = webpackAliasResolveAbsPath(alias, webpackConfigFile)
      let normalizedAliasName = (alias[alias.length - 1] == "$") ? alias.substring(0, alias.length - 1) : alias 
      let isExactMatch = mod == alias.substring(0, alias.length - 1)
      
      if (isExactMatch || mod == alias || (mod+path.sep).indexOf(normalizedAliasName+path.sep) >= 0 ) {
        result.moduleAbsPath = path.normalize(mod.replace(normalizedAliasName, aliasAbsPath))
        if (mod == alias && path.extname(aliasAbsPath)) {
          result.keepRelative = true
        }

        // check if alias resolver results in an error
        if (path.extname(path.parse(result.moduleAbsPath).dir)) {
          result.isWebpackError = true
          break
        }

        if (fs.existsSync(result.moduleAbsPath) && fs.lstatSync(result.moduleAbsPath).isDirectory()) {
          // points to main attribute of package.json, default is index.js
          let mainAttrPackageJson = 'index.js'
          let packageJsonModule = path.join(result.moduleAbsPath, 'package.json')
          packageJsonModule = (fs.existsSync(packageJsonModule)) ? JSON.parse(fs.readFileSync(packageJsonModule, 'utf8')) : null
          if (packageJsonModule && packageJsonModule.main) {
            mainAttrPackageJson = packageJsonModule.main
          }
          result.moduleAbsPath = path.join(result.moduleAbsPath, mainAttrPackageJson)
          result.module = path.join(mod, mainAttrPackageJson)
        }
        break
      }

    }
  }

  return result
}

function webpackFindAlias(modulePath/*: string*/, webpackConfigFile/*: string*/)/*: string*/ {

  if (!fs.existsSync(webpackConfigFile)) {
    throw new Error(webpackConfigFile + ' webpack config file doesn\'t exists.')
  }

  let moduleAbsPath = path.resolve(modulePath)

  // $FlowFixMe
  let result = require(path.resolve(webpackConfigFile))
  if (result.resolve && result.resolve.alias) {
    for (let alias /*: string*/ in result.resolve.alias) {
      let aliasAbsPath = webpackAliasResolveAbsPath(alias, webpackConfigFile)

      if (fs.existsSync(aliasAbsPath) && fs.lstatSync(aliasAbsPath).isDirectory()) {
        // points to main attribute of package.json, default is index.js
        let mainAttrPackageJson = 'index.js'
        let packageJsonModule = path.join(aliasAbsPath, 'package.json')
        packageJsonModule = (fs.existsSync(packageJsonModule)) ? JSON.parse(fs.readFileSync(packageJsonModule, 'utf8')) : null
        if (packageJsonModule && packageJsonModule.main) {
          mainAttrPackageJson = packageJsonModule.main
        }
        aliasAbsPath = path.join(aliasAbsPath, mainAttrPackageJson)
      }
      
      if (moduleAbsPath == aliasAbsPath) {
        let normalizedAliasName = (alias[alias.length - 1] == "$") ? alias.substring(0, alias.length - 1) : alias 
        return normalizedAliasName
      }
    }
  }

  return ""
}

function webpackAliasResolveAbsPath(alias/*: string*/, webpackConfigFile/*: string*/)/*: string*/ {
  let aliasAbsPath = ""
  // $FlowFixMe
  let webpackConfig = require(path.resolve(webpackConfigFile))
  if (path.isAbsolute(webpackConfig.resolve.alias[alias])) {
    aliasAbsPath = webpackConfig.resolve.alias[alias]
  }
  else {
    if (webpackConfig.resolve.modules) {
      for (let mod /*: string*/ of webpackConfig.resolve.modules) {
        let modPath = (path.isAbsolute(mod)) ? mod : path.resolve(mod)
        if (fs.existsSync(modPath)) {
          aliasAbsPath = path.join( modPath, webpackConfig.resolve.alias[alias] )
          break
        }
      }
    }
    else {
      aliasAbsPath = path.join(path.dirname(path.resolve(webpackConfigFile)), webpackConfig.resolve.alias[alias])
    }
  }
  return aliasAbsPath
}

module.exports = {
  flowTraverseAST,
  typescriptTraverseAST,
  webpackAliasResolver,
  webpackFindAlias
}