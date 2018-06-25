#!/usr/bin/env node

// @flow

const commander = require('commander'),
  fs = require('fs'),
  path = require('path'),
  colors = require('colors'),
  findDependencies = require('./find-dependencies'),
  findDependents = require('./find-dependents'),
  version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version

commander
  .version(version)
  .option('-j, --json', 'Output results in JSON format')
  .option('-p, --pretty', 'Pretty-print JSON output (implies --json)')
  .option('-a, --abs-path', 'Print absolute path of dependencies/dependents')
  .option('-e, --exclude-node-modules', 'Don\'t consider node_modules dependencies', false)
  .option('-w, --webpack-config [webpackConfigFile]', 'Webpack config file for resolving aliased modules')
  .option('-s, --specifiers', 'Show specifiers imported by the dependency/dependent', false)

commander
  .command('find-dependencies <glob> [otherGlobs...]')
  .action((glob/*: string*/, otherGlobs/*: Array<string> */, options/*: {parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string, specifiers: boolean} }*/) => {
    
    let result = findDependencies([glob, ...otherGlobs], options)

    if (options.parent.json) {
      let jsonOutput = (options.parent.pretty) ? JSON.stringify(result, null, 2) : JSON.stringify(result)
      console.log(jsonOutput)
    }
    else {
      for (let entry in result) {
        let i = 0
        console.log(colors.cyan(colors.bold.italic(entry) + ", found " + result[entry].files + " dependencies:"))
        if (!result[entry].files) 
          console.log('  ' + colors.bold('No dependencies found!'))
        else
          for (let dependency of result[entry].dependencies) 
            console.log( 
              ( (i < 9) ? "  " : " " ) + (++i) + ") " + colors.bold( (options.parent.absPath) ? dependency.importAbsolutePath : dependency.importPath ) + 
              ( (options.parent.specifiers && dependency.specifiers.length > 0) ? ", specifiers imported: " + colors.italic( dependency.specifiers.map((specifier) => {return (specifier.alias) ? specifier.name + " as " + specifier.alias : specifier.name}).join(', ') ) : '' ) 
            )
        console.log("")
      }
    }

  })

commander
  .command('find-dependents <glob> [otherGlobs...]')
  .option('-r, --root [root]', 'Root folder from where to start the search')
  .action((glob/*: string*/, otherGlobs/*: Array<string> */, options/*: {root: string, parent: {excludeNodeModules: boolean, json: boolean, pretty: boolean, absPath: boolean, webpackConfig: string, specifiers: boolean} }*/) => {
    
    let result = findDependents([glob, ...otherGlobs], options)

    if (options.parent.json) {
      let jsonOutput = (options.parent.pretty) ? JSON.stringify(result, null, 2) : JSON.stringify(result)
      console.log(jsonOutput)
    }
    else {
      for (let entry in result) {
        let i = 0
        console.log(colors.cyan(colors.bold.italic(entry) + ", found " + result[entry].files + " dependents:"))
        if (!result[entry].files) 
          console.log('  ' + colors.bold('No dependents found!'))
        else
          for (let dependent of result[entry].dependents) {
            console.log( 
              ( (i < 9) ? "  " : " " ) + (++i) + ") " + colors.bold( (options.parent.absPath) ? dependent.fileAbsolutePath : dependent.filePath ) + 
              ( (options.parent.specifiers && dependent.specifiers.length > 0) ? ", specifiers imported: " + colors.italic( dependent.specifiers.map((specifier) => {return (specifier.alias) ? specifier.name + " as " + specifier.alias : specifier.name}).join(', ') ) : '' ) 
            )
          }
        console.log("")
      }
    }

  })

commander.parse(process.argv)
