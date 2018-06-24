#!/usr/bin/env node

// @flow

const commander = require('commander'),
  fs = require('fs'),
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
  .command('find-dependencies [inputFile]')
  .action((inputFile/*:string*/, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string} }*/) => {
    
    let dependencies = findDependencies(inputFile, options)

    if (dependencies.length == 0) {
      console.log('No dependencies found!')
    }

    if (options.parent.json) {
      let jsonOutput = (options.parent.pretty) ? JSON.stringify(dependencies, null, 2) : JSON.stringify(dependencies)
      console.log(jsonOutput)
    }
    else {
      Array.from(new Set(dependencies)).map((filename, index) => {
        console.log(filename)
      })
    }

  })

commander
  .command('find-dependents [inputFile]')
  .option('-r, --root [root]', 'Root folder from where to start the search')
  .action((inputFile/*:string*/, options/*: {root: string, parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string} }*/) => {
    
    let dependents = findDependents(inputFile, options)

    if (dependents.length == 0) {
      console.log('No dependents found!')
    }

    if (options.parent.json) {
      let jsonOutput = (options.parent.pretty) ? JSON.stringify(dependents, null, 2) : JSON.stringify(dependents)
      console.log(jsonOutput)
    }
    else {
      Array.from(new Set(dependents)).map((filename, index) => {
        console.log(filename)
      })
    }

  })

commander.parse(process.argv)
