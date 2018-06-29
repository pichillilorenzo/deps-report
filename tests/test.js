// @flow

import test from 'ava'
import findDependencies from '../lib/find-dependencies'
import findDependents from '../lib/find-dependents'

const path = require("path"),
  depsReportPath = path.resolve(path.join(__dirname, '..'))

let testResults = JSON.stringify(require("./testResults.json"))
// prepare testResult
testResults = JSON.parse(testResults.replace(/\/Users\/lorenzo\/Desktop\/deps\-report/g, depsReportPath))

/*
  project-test folder
 */

test('Test find-dependencies in project-test folder', t => {

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependencies "tests/project-test/a.js"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependencies "tests/project-test/a.js"
  let optionsFindDependencies = {circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/a.js"], optionsFindDependencies), testResults[0])

  // ./lib/cli.js -se -w tests/project-test/webpack.config.js find-dependencies "tests/project-test/a.js"
  // ./lib/cli.js -jse -w tests/project-test/webpack.config.js find-dependencies "tests/project-test/a.js"
  optionsFindDependencies = {circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: true, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/a.js"], optionsFindDependencies), testResults[1])

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependencies -c "tests/project-test/*.ts"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependencies -c "tests/project-test/*.ts"
  optionsFindDependencies = {circular: true, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/*.ts"], optionsFindDependencies), testResults[2])

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependencies --only-circular "tests/project-test/*.ts"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependencies --only-circular "tests/project-test/*.ts"
  optionsFindDependencies = {circular: false, onlyCircular: true, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/*.ts"], optionsFindDependencies), testResults[3])

  // ./lib/cli.js -w tests/project-test/webpack.config.js find-dependencies --only-not-found "tests/project-test/*.ts"
  // ./lib/cli.js -j -w tests/project-test/webpack.config.js find-dependencies --only-not-found "tests/project-test/*.ts"
  optionsFindDependencies = {circular: false, onlyCircular: false, onlyNotFound: true, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/*.ts"], optionsFindDependencies), testResults[4])

  // ./lib/cli.js -se -w tests/project-test/webpack.config.js find-dependencies "tests/project-test/b.ts"
  // ./lib/cli.js -jse -w tests/project-test/webpack.config.js find-dependencies "tests/project-test/b.ts"
  optionsFindDependencies = {circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: true, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/b.ts"], optionsFindDependencies), testResults[5])

})

test('Test find-dependents in project-test folder', t => {

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependents "tests/project-test/b.ts"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependents "tests/project-test/b.ts"
  let optionsFindDependents = {root: '', circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependents(["tests/project-test/b.ts"], optionsFindDependents), testResults[6])

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependents "tests/project-test/a.js"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependents "tests/project-test/a.js"
  t.deepEqual(findDependents(["tests/project-test/a.js"], optionsFindDependents), testResults[7])

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependents --only-circular -r "tests/project-test" "tests/project-test/c/d.js"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependents --only-circular -r "tests/project-test" "tests/project-test/c/d.js"
  optionsFindDependents = {root: 'tests/project-test', circular: false, onlyCircular: true, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependents(["tests/project-test/c/d.js"], optionsFindDependents), testResults[8])

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependents -c -r "tests/project-test" "tests/project-test/c/d.js"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependents -c -r "tests/project-test" "tests/project-test/c/d.js"
  optionsFindDependents = {root: 'tests/project-test', circular: true, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependents(["tests/project-test/c/d.js"], optionsFindDependents), testResults[9])

  // ./lib/cli.js -s -w tests/project-test/webpack.config.js find-dependents -r "tests/project-test" "tests/project-test/src/templates/*.js" "tests/project-test/src/utilities/*.js"
  // ./lib/cli.js -js -w tests/project-test/webpack.config.js find-dependents -r "tests/project-test" "tests/project-test/src/templates/*.js" "tests/project-test/src/utilities/*.js"
  optionsFindDependents = {root: 'tests/project-test', circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents), testResults[10])

  // ./lib/cli.js -s -w tests/project-test/webpack2.config.js find-dependents -r "tests/project-test" "tests/project-test/src/templates/*.js" "tests/project-test/src/utilities/*.js"
  // ./lib/cli.js -js -w tests/project-test/webpack2.config.js find-dependents -r "tests/project-test" "tests/project-test/src/templates/*.js" "tests/project-test/src/utilities/*.js"
  optionsFindDependents = {root: 'tests/project-test', circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack2.config.js', specifiers: true, color: false} }
  t.deepEqual(findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents), testResults[10])

  // ./lib/cli.js -w tests/project-test/webpack.config.js find-dependents --only-not-found -r "tests/project-test" "tests/project-test/src/templates/*.js" "tests/project-test/src/utilities/*.js"
  // ./lib/cli.js -j -w tests/project-test/webpack.config.js find-dependents --only-not-found -r "tests/project-test" "tests/project-test/src/templates/*.js" "tests/project-test/src/utilities/*.js"
  optionsFindDependents = {root: 'tests/project-test', circular: false, onlyCircular: false, onlyNotFound: true, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents), testResults[11])

})

// /*
//   project-react-js-test folder
//  */

test('Test find-dependencies in project-react-js-test folder', t => {

  // ./lib/cli.js -s find-dependencies -c "tests/project-react-js-test/src/*.js" '!tests/project-react-js-test/src/*.test.js'
  // ./lib/cli.js -js find-dependencies -c "tests/project-react-js-test/src/*.js" '!tests/project-react-js-test/src/*.test.js'
  let optionsFindDependencies = {circular: true, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: '', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-react-js-test/src/*.js", "!tests/project-react-js-test/src/*.test.js"], optionsFindDependencies), testResults[12])

  // ./lib/cli.js -se find-dependencies "tests/project-react-js-test/src/*.js"
  // ./lib/cli.js -jse find-dependencies "tests/project-react-js-test/src/*.js"
  optionsFindDependencies = {circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: true, json: false, pretty: false, absPath: false, webpackConfig: '', specifiers: true, color: false} }
  t.deepEqual(findDependencies(["tests/project-react-js-test/src/*.js"], optionsFindDependencies), testResults[13])

})

test('Test find-dependents in project-react-js-test folder', t => {

  // ./lib/cli.js -s find-dependents "tests/project-react-js-test/src/*.js"
  // ./lib/cli.js -js find-dependents "tests/project-react-js-test/src/*.js"
  let optionsFindDependents = {root: '', circular: false, onlyCircular: false, onlyNotFound: false, hideNotFound: false, parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: '', specifiers: true, color: false} }
  t.deepEqual(findDependents(["tests/project-react-js-test/src/*.js"], optionsFindDependents), testResults[14])

})