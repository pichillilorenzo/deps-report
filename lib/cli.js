#!/usr/bin/env node

// @flow

const commander = require('commander'),
  fs = require('fs'),
  colors = require('colors'),
  findDependencies = require('./find-dependencies'),
  findDependents = require('./find-dependents'),
  version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version

commander
  .version(version)
  .option('-j, --json', 'Output results in JSON format')
  .option('-p, --pretty', 'Pretty-print JSON output (implies --json)')
  .option('-a, --abs-path', 'Print absolute path of dependencies/dependents')
  .option('-e, --exclude-node-modules', 'Don\'t consider node_modules dependencies', false)
  .option('-w, --webpack-config [webpackConfigFile]', 'Webpack config file for resolving aliased modules')

commander
  .command('find-dependencies <glob> [otherGlobs...]')
  .action((glob/*: string*/, otherGlobs/*: Array<string> */, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string} }*/) => {
    
    let result = findDependencies([glob, ...otherGlobs], options)

    if (options.parent.json) {
      let jsonOutput = (options.parent.pretty) ? JSON.stringify(result, null, 2) : JSON.stringify(result)
      console.log(jsonOutput)
    }
    else if (!result) {
      console.log('No dependencies found!')
    }
    else {
      for (let entry in result) {
        console.log(colors.cyan("Dependencies of " + colors.bold.italic(entry) + ":"))
        for (let dependency of result[entry].dependencies) 
          console.log( "  - " + ((options.parent.absPath) ? dependency.absolutePath : dependency.path) )
        console.log("")
      }
    }

  })

commander
  .command('find-dependents [glob]')
  .option('-r, --root [root]', 'Root folder from where to start the search')
  .action((glob/*:string*/, options/*: {root: string, parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string} }*/) => {
    
    let dependents = findDependents(glob, options)

    if (options.parent.json) {
      let jsonOutput = (options.parent.pretty) ? JSON.stringify(dependents, null, 2) : JSON.stringify(dependents)
      console.log(jsonOutput)
    }
    else if (dependents.length == 0) {
      console.log('No dependents found!')
    }
    else {
      Array.from(new Set(dependents)).map((filename, index) => {
        console.log(filename)
      })
    }

  })

commander.parse(process.argv)
