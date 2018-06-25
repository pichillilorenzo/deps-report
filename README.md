# deps-report

![node version](https://img.shields.io/node/v/deps-report.svg)
[![npm downloads](https://img.shields.io/npm/dm/deps-report.svg)](https://www.npmjs.com/package/deps-report)
[![deps-report version](https://img.shields.io/npm/v/deps-report.svg)](https://www.npmjs.com/package/deps-report)
[![Travis](https://img.shields.io/travis/pichillilorenzo/deps-report.svg?branch=master)](https://travis-ci.org/pichillilorenzo/deps-report)
[![Coverage Status](https://coveralls.io/repos/github/pichillilorenzo/deps-report/badge.svg?branch=master)](https://coveralls.io/github/pichillilorenzo/deps-report?branch=master)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](/LICENSE.txt)

Generate reports about dependencies and dependents of your JavaScript/TypeScript files through an **AST**. It supports `import` and `require` statements.

Parsers used:
  - [flow-parser](https://www.npmjs.com/package/flow-parser) for `.js` files
  - [typescript](https://github.com/Microsoft/TypeScript) for `.ts` files


## Install

```
npm install -g deps-report
```


## CLI Usage

```
Usage: deps-report [options] [command]

Options:

  -V, --version                             output the version number
  -j, --json                                Output results in JSON format
  -p, --pretty                              Pretty-print JSON output (implies --json)
  -a, --abs-path                            Print absolute path of dependencies/dependents
  -e, --exclude-node-modules                Don't consider node_modules dependencies
  -w, --webpack-config [webpackConfigFile]  Webpack config file for resolving aliased modules
  -s, --specifiers                          Show specifiers imported by the dependency/dependent
  -h, --help                                output usage information

Commands:

  find-dependencies <glob> [otherGlobs...]

      Usage: find-dependencies [options] <glob> [otherGlobs...]
      Options:

        -h, --help  output usage information


  find-dependents [options] <glob> [otherGlobs...]

      Usage: find-dependents [options] <glob> [otherGlobs...]
      Options:

        -r, --root [root]  Root folder from where to start the search
        -h, --help         output usage information

```


## Examples find-dependencies

```
$ deps-report find-dependencies tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.js, found 3 dependencies:
  1) react
  2) ./logo.svg
  3) ./App.css


$ deps-report -s find-dependencies tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.js, found 3 dependencies:
  1) react, specifiers imported: React, Component
  2) ./logo.svg, specifiers imported: logo
  3) ./App.css


$ deps-report -a find-dependencies tests/project-react-js-test/src/*.js

tests/project-react-js-test/src/App.js, found 3 dependencies:
  1) react
  2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/logo.svg
  3) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.css

tests/project-react-js-test/src/App.test.js, found 3 dependencies:
  1) react
  2) react-dom
  3) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/index.js, found 5 dependencies:
  1) react
  2) react-dom
  3) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.css
  4) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js
  5) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/registerServiceWorker.js

tests/project-react-js-test/src/registerServiceWorker.js, found 0 dependencies:
  No dependencies found!


$ deps-report -ae find-dependencies tests/project-react-js-test/src/*.js

tests/project-react-js-test/src/App.js, found 2 dependencies:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/logo.svg
  2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.css

tests/project-react-js-test/src/App.test.js, found 1 dependencies:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/index.js, found 3 dependencies:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.css
  2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js
  3) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/registerServiceWorker.js

tests/project-react-js-test/src/registerServiceWorker.js, found 0 dependencies:
  No dependencies found!


$ deps-report -ae find-dependencies tests/project-react-js-test/src/*.js '!tests/project-react-js-test/src/**/*.test.js'

tests/project-react-js-test/src/App.js, found 2 dependencies:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/logo.svg
  2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.css

tests/project-react-js-test/src/index.js, found 3 dependencies:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.css
  2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js
  3) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/registerServiceWorker.js

tests/project-react-js-test/src/registerServiceWorker.js, found 0 dependencies:
  No dependencies found!


$ deps-report -w tests/project-test/webpack.config.js find-dependencies tests/project-test/a.js

tests/project-test/a.js, found 12 dependencies:
  1) path
  2) fs, specifiers imported: fs, readFileSync, readFile as readFileAsync
  3) ./c/d.js, specifiers imported: d
  4) Utilities/index.js, specifiers imported: Utilities
  5) UtilitiesRelativePath, specifiers imported: UtilitiesRelativePath
  6) Utilities/utilityA.js, specifiers imported: utilityA
  7) Templates/main.js, specifiers imported: templates
  8) TemplatesMain, specifiers imported: templatesMain
  9) MyPath, specifiers imported: MyPath
 10) fs, specifiers imported: fs1
 11) ./e/b.js, specifiers imported: b_folder_e
 12) ./c/d.js, specifiers imported: d1, d2


$ deps-report -ae -w tests/project-test/webpack.config.js find-dependencies tests/project-test/a.js

tests/project-test/a.js, found 8 dependencies:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-test/c/d.js
  2) /Users/lorenzo/Desktop/deps-report/tests/project-test/src/utilities/index.js
  3) /Users/lorenzo/Desktop/deps-report/tests/project-test/src/utilities/relative.js
  4) /Users/lorenzo/Desktop/deps-report/tests/project-test/src/utilities/utilityA.js
  5) /Users/lorenzo/Desktop/deps-report/tests/project-test/src/templates/main.js
  6) /Users/lorenzo/Desktop/deps-report/tests/project-test/src/templates/main.js
  7) /Users/lorenzo/Desktop/deps-report/tests/project-test/e/b.js
  8) /Users/lorenzo/Desktop/deps-report/tests/project-test/c/d.js
```

JSON format example:

```
$ deps-report -jp find-dependencies tests/project-react-js-test/src/App.js

{
  "tests/project-react-js-test/src/App.js": {
    "absolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js",
    "files": 3,
    "dependencies": [
      {
        "importPath": "react",
        "importAbsolutePath": "react",
        "isNodeModule": true,
        "specifiers": [
          {
            "name": "React",
            "alias": "",
            "isDefault": true
          },
          {
            "name": "Component",
            "alias": "",
            "isDefault": false
          }
        ]
      },
      {
        "importPath": "./logo.svg",
        "importAbsolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/logo.svg",
        "isNodeModule": false,
        "specifiers": [
          {
            "name": "logo",
            "alias": "",
            "isDefault": true
          }
        ]
      },
      {
        "importPath": "./App.css",
        "importAbsolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.css",
        "isNodeModule": false,
        "specifiers": []
      }
    ]
  }
}
```


## Examples find-dependents

```
$ deps-report find-dependents tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.js, found 2 dependents:
  1) tests/project-react-js-test/src/App.test.js
  2) tests/project-react-js-test/src/index.js


$ deps-report -s find-dependents tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.js, found 2 dependents:
  1) tests/project-react-js-test/src/App.test.js, specifiers imported: App
  2) tests/project-react-js-test/src/index.js, specifiers imported: App


$ deps-report -as find-dependents tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.js, found 2 dependents:
  1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.test.js, specifiers imported: App
  2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.js, specifiers imported: App


$ deps-report find-dependents tests/project-test/a1.ts

tests/project-test/a1.ts, found 0 dependents:
  No dependents found!


$ deps-report find-dependents -r tests/project-test tests/project-test/c/d.js

tests/project-test/c/d.js, found 4 dependents:
  1) tests/project-test/a.js
  2) tests/project-test/e/b.js
  3) tests/project-test/a.ts
  4) tests/project-test/b.ts


$ deps-report -es -w tests/project-test/webpack.config.js find-dependents -r tests/project-test/ tests/project-test/src/utilities/index.js tests/project-test/src/templates/main.js

tests/project-test/src/utilities/index.js, found 2 dependents:
  1) tests/project-test/a.js, specifiers imported: Utilities
  2) tests/project-test/a.ts, specifiers imported: Utilities

tests/project-test/src/templates/main.js, found 3 dependents:
  1) tests/project-test/a.js, specifiers imported: templates
  2) tests/project-test/src/utilities/index.js, specifiers imported: templates
  3) tests/project-test/a.ts, specifiers imported: templates
```

You can search also **images** and **css** files imported in your javascript files (such as in a React project):

```
$ deps-report -s find-dependents tests/project-react-js-test/src/logo.svg

tests/project-react-js-test/src/logo.svg, found 1 dependents:
  1) tests/project-react-js-test/src/App.js, specifiers imported: logo


$ deps-report find-dependents tests/project-react-js-test/src/App.css

tests/project-react-js-test/src/App.css, found 1 dependents:
  1) tests/project-react-js-test/src/App.js
```


## API Usage

```javascript
const depsReport = require('deps-report')

// find-dependencies command options

let optionsFindDependencies = {
  parent: {
    excludeNodeModules: false, 
    json: false, 
    pretty: false, 
    absPath: false, 
    webpackConfig: 'tests/project-test/webpack.config.js', 
    specifiers: false
  } 
}

depsReport.findDependencies(["tests/project-test/a.js"], optionsFindDependencies)


// find-dependents command options

let optionsFindDependents = {
  root: 'tests/project-test', 
  parent: {
    excludeNodeModules: false, 
    json: false, 
    pretty: false, 
    absPath: false, 
    webpackConfig: 'tests/project-test/webpack.config.js', 
    specifiers: false
  } 
}

depsReport.findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents)
```


## License

_MIT License_