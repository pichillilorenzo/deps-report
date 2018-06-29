#!/usr/bin/env node

// @flow

const commander = require('commander'),
  chalk = require('chalk'),
  findDependencies = require('./find-dependencies'),
  findDependents = require('./find-dependents'),
  packageJson = require('../package.json'),
  version = packageJson.version,
  NS_PER_SEC = 1e9,
  MS_PER_NS = 1e-6

commander
  .version(version)
  .option('-j, --json', 'Output results in JSON format')
  .option('-p, --pretty', 'Pretty-print JSON output (implies --json)')
  .option('-a, --abs-path', 'Print absolute path of dependencies/dependents')
  .option('-e, --exclude-node-modules', 'Don\'t consider node_modules dependencies', false)
  .option('-w, --webpack-config [webpackConfigFile]', 'Webpack config file for resolving aliased modules')
  .option('-s, --specifiers', 'Show specifiers imported by the dependency/dependent', false)
  .option('--no-color', 'Display terminal output without colors')

commander
  .command('find-dependencies <glob> [otherGlobs...]')
  .option('-c, --circular', 'Show if there are some circular dependencies')
  .option('--only-not-found', 'Show all modules that have no dependencies')
  .option('--hide-not-found', 'Hide all modules that have no dependencies')
  .option('--only-circular', 'Show only circular dependencies')
  .action((glob/*: string*/, otherGlobs/*: Array<string> */, options/*: FindDependenciesCommandOptions*/) => {

    const time = process.hrtime()
    const result = findDependencies([glob, ...otherGlobs], options)
    const diff = process.hrtime(time)
    const processTime = ((diff[0] * NS_PER_SEC + diff[1]) * MS_PER_NS).toFixed(3)

    if (options.parent.json) {
      const jsonOutput = (options.parent.pretty) ? JSON.stringify(result, null, 2) : JSON.stringify(result)
      console.log(jsonOutput)
    }
    else {
      const lengthResult = Object.keys(result).length
      console.log(`\nProcessed ${ chalk.yellow.bold(lengthResult) } ${ (lengthResult == 1) ? 'file' : 'files' } in ${ chalk.yellow.bold( processTime + 'ms') }.`)
      if (options.onlyNotFound) 
        console.log('')

      for (let entry in result) {
        if (options.onlyNotFound) {
          console.log( chalk.cyan.italic( (options.parent.absPath) ? result[entry].absolutePath : entry) )
        }
        else {
          if (options.hideNotFound && !result[entry].files)
            continue 

          let i = 0
          console.log('')
          console.log(chalk.cyan(chalk.bold.italic(entry) + ", found " + chalk.bold(result[entry].files) + " " + ( (result[entry].files == 1) ? "dependency" : "dependencies" ) + ":"))
          if (!result[entry].files) 
            console.log('    ' + chalk.red.bold('No dependencies found!'))
          else
            for (let dependency of result[entry].dependencies) 
              console.log( 
                ( (i < 9) ? ' ' : '' ) + (++i) + ") " + chalk.green.bold( (options.parent.absPath) ? dependency.importAbsolutePath : dependency.importPath ) + 
                ( (options.circular && dependency.isCircularDependency) ? ', ' + chalk.yellow.bold('Circular Dependency') : '' ) +
                ( (options.parent.specifiers && dependency.specifiers.length > 0) ? ", specifiers imported: " + chalk.italic( dependency.specifiers.map((specifier) => {return (specifier.alias) ? specifier.name + " as " + specifier.alias : ( (specifier.isDefault) ? "default as " + specifier.name : specifier.name )}).join(', ') ) : '' ) 
              )
        }
      }
      console.log('')
    }

  })

commander
  .command('find-dependents <glob> [otherGlobs...]')
  .option('-r, --root [root]', 'Root folder from where to start the search. Default is the dirname of each glob entry')
  .option('-c, --circular', 'Show if there are some circular dependencies')
  .option('--only-not-found', 'Show all modules that no one is depending on')
  .option('--hide-not-found', 'Hide all modules that no one is depending on')
  .option('--only-circular', 'Show only circular dependencies')
  .action((glob/*: string*/, otherGlobs/*: Array<string> */, options/*: FindDependentsCommandOptions*/) => {

    const time = process.hrtime()
    const result = findDependents([glob, ...otherGlobs], options)
    const diff = process.hrtime(time)
    const processTime = ((diff[0] * NS_PER_SEC + diff[1]) * MS_PER_NS).toFixed(3)

    if (options.parent.json) {
      const jsonOutput = (options.parent.pretty) ? JSON.stringify(result, null, 2) : JSON.stringify(result)
      console.log(jsonOutput)
    }
    else {
      const lengthResult = Object.keys(result).length
      console.log(`\nProcessed ${ chalk.yellow.bold(lengthResult) } ${ (lengthResult == 1) ? 'file' : 'files' } in ${ chalk.yellow.bold( processTime + 'ms') }.`)
      if (options.onlyNotFound) 
        console.log('')
    
      for (let entry in result) {
        if (options.onlyNotFound) {
          console.log( chalk.cyan.italic( (options.parent.absPath) ? result[entry].absolutePath : entry) )
        }
        else {
          if (options.hideNotFound && !result[entry].files)
            continue

          let i = 0
          console.log('')
          console.log(chalk.cyan(chalk.bold.italic(entry) + ", found " + chalk.bold(result[entry].files) + " " + ( (result[entry].files == 1) ? "dependent" : "dependents" ) + ":"))

          if (!result[entry].files) 
            console.log('    ' + chalk.red.bold('No dependents found!'))
          else
            for (let dependent of result[entry].dependents)
              console.log( 
                ( (i < 9) ? ' ' : '' ) + (++i) + ") " + chalk.green.bold( (options.parent.absPath) ? dependent.fileAbsolutePath : dependent.filePath ) + 
                ( (options.circular && dependent.isCircularDependency) ? ', ' + chalk.yellow.bold('Circular Dependency') : '' ) +
                ( (options.parent.specifiers && dependent.specifiers.length > 0) ? ", specifiers imported: " + chalk.italic( dependent.specifiers.map((specifier) => {return (specifier.alias) ? specifier.name + " as " + specifier.alias : ( (specifier.isDefault) ? "default as " + specifier.name : specifier.name )}).join(', ') ) : '' ) 
              )
        }
          
      }
      console.log('')
    }

  })

commander.parse(process.argv)