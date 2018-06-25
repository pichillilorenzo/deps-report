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

  let optionsFindDependencies = {parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/a.js"], optionsFindDependencies), testResults[0])

  optionsFindDependencies = {parent: {excludeNodeModules: true, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/a.js"], optionsFindDependencies), testResults[1])

  optionsFindDependencies = {parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/*.ts"], optionsFindDependencies), testResults[2])

  optionsFindDependencies = {parent: {excludeNodeModules: true, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-test/b.ts"], optionsFindDependencies), testResults[3])
})

test('Test find-dependents in project-test folder', t => {

  let optionsFindDependents = {root: '', parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependents(["tests/project-test/b.ts"], optionsFindDependents), testResults[4])

  t.deepEqual(findDependents(["tests/project-test/a.js"], optionsFindDependents), testResults[5])

  optionsFindDependents = {root: 'tests/project-test', parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack.config.js', specifiers: false, color: false} }
  t.deepEqual(findDependents(["tests/project-test/c/d.js"], optionsFindDependents), testResults[6])

  t.deepEqual(findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents), testResults[7])

  optionsFindDependents = {root: 'tests/project-test', parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack2.config.js', specifiers: false, color: false} }

  t.deepEqual(findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents), testResults[8])
})

// /*
//   project-react-js-test folder
//  */

test('Test find-dependencies in project-react-js-test folder', t => {

  let optionsFindDependencies = {parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: '', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-react-js-test/src/*.js", "!tests/project-react-js-test/src/*.test.js"], optionsFindDependencies), testResults[9])

  optionsFindDependencies = {parent: {excludeNodeModules: true, json: false, pretty: false, absPath: false, webpackConfig: '', specifiers: false, color: false} }
  t.deepEqual(findDependencies(["tests/project-react-js-test/src/*.js"], optionsFindDependencies), testResults[10])

})

test('Test find-dependents in project-react-js-test folder', t => {

  let optionsFindDependents = {root: '', parent: {excludeNodeModules: false, json: false, pretty: false, absPath: false, webpackConfig: '', specifiers: false, color: false} }
  t.deepEqual(findDependents(["tests/project-react-js-test/src/*.js"], optionsFindDependents), testResults[11])

})