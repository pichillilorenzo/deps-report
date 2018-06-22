#!/usr/bin/env node

// @flow

const commander = require('commander'),
  path = require("path"),
  findDependencies = require('./find-dependencies'),
  findDependents = require('./find-dependents')

commander
  .version('0.1.0')
  .option('--json', 'Output results in JSON format')
  .option('--pretty', 'Pretty-print JSON output (implies --json)')
  .option('--abs-path', 'Print absolute path of dependencies/dependents')
  .option('--exclude-node-modules', 'Don\'t consider node_modules dependencies', false)

commander
  .command('find-dependencies [inputFile]')
  .action((inputFile/*:string*/, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean} }*/) => {
    
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
        console.log(`${filename} is a dependency of ${path.basename(inputFile)}`)
      })
    }

  })

commander
  .command('find-dependents [inputFile]')
  .option('-r, --root [root]', 'Root folder from where to start the search')
  .action((inputFile/*:string*/, options/*: {root: string, parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean} }*/) => {
    
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
        console.log(`${filename} depends on ${path.basename(inputFile)}`)
      })
    }

  })

commander.parse(process.argv)
