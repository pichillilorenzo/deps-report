// @flow

import test from 'ava'
import findDependencies from '../lib/find-dependencies'
import findDependents from '../lib/find-dependents'

/*
  project-test folder
 */

test('Test find-dependencies in project-test folder', t => {

  let optionsFindDependencies = {parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependencies("tests/project-test/a.js", optionsFindDependencies), ["fs", "./c/d.js", "Utilities/index.js", "Utilities/utilityA.js", "Templates/main.js", "TemplatesMain", "MyPath", "fs", "./e/b.js", "./c/d.js"])
  optionsFindDependencies = {parent: {excludeNodeModules: true, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependencies("tests/project-test/a.js", optionsFindDependencies), ["./c/d.js", "Utilities/index.js", "Utilities/utilityA.js", "Templates/main.js", "TemplatesMain", "./e/b.js", "./c/d.js"])
  optionsFindDependencies = {parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependencies("tests/project-test/a1.ts", optionsFindDependencies), ["fs", "fs", "./b.ts", "./e/b.js"])

  optionsFindDependencies = {parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependencies("tests/project-test/b.ts", optionsFindDependencies), ["path", "./c/d.js", "fs", "path"])

  optionsFindDependencies = {parent: {excludeNodeModules: true, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependencies("tests/project-test/b.ts", optionsFindDependencies), ["./c/d.js"])
})

test('Test find-dependents in project-test folder', t => {

  let optionsFindDependents = {root: '', parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependents("tests/project-test/b.ts", optionsFindDependents), ["tests/project-test/c/d.js", "tests/project-test/a1.ts"])

  t.deepEqual(findDependents("tests/project-test/a.js", optionsFindDependents), ["tests/project-test/c/d.js"])

  optionsFindDependents = {root: 'tests/project-test', parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: 'tests/project-test/webpack-config.js'} }
  t.deepEqual(findDependents("tests/project-test/c/d.js", optionsFindDependents), ["tests/project-test/a.js", "tests/project-test/e/b.js", "tests/project-test/b.ts"])
})

/*
  project-react-js-test folder
 */

test('Test find-dependencies in project-react-js-test folder', t => {

  let optionsFindDependencies = {parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: ''} }
  t.deepEqual(findDependencies("tests/project-react-js-test/src/App.js", optionsFindDependencies), ["react", "./logo.svg", "./App.css"])

  t.deepEqual(findDependencies("tests/project-react-js-test/src/index.js", optionsFindDependencies), ["react", "react-dom", "./index.css", "./App.js", "./registerServiceWorker.js"])

  optionsFindDependencies = {parent: {excludeNodeModules: true, json: true, pretty: false, absPath: false, webpackConfig: ''} }
  t.deepEqual(findDependencies("tests/project-react-js-test/src/index.js", optionsFindDependencies), ["./index.css", "./App.js", "./registerServiceWorker.js"])

})

test('Test find-dependents in project-react-js-test folder', t => {

  let optionsFindDependents = {root: '', parent: {excludeNodeModules: false, json: true, pretty: false, absPath: false, webpackConfig: ''} }
  t.deepEqual(findDependents("tests/project-react-js-test/src/App.js", optionsFindDependents), ["tests/project-react-js-test/src/App.test.js", "tests/project-react-js-test/src/index.js"])

  t.deepEqual(findDependents("tests/project-react-js-test/src/registerServiceWorker.js", optionsFindDependents), ["tests/project-react-js-test/src/index.js"])

})