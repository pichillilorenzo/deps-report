# deps-report

![node version](https://img.shields.io/node/v/deps-report.svg)
[![npm downloads](https://img.shields.io/npm/dm/deps-report.svg)](https://www.npmjs.com/package/deps-report)
[![deps-report version](https://img.shields.io/npm/v/deps-report.svg)](https://www.npmjs.com/package/deps-report)
[![Travis](https://img.shields.io/travis/pichillilorenzo/deps-report.svg?branch=master)](https://travis-ci.org/pichillilorenzo/deps-report)
[![Coverage Status](https://coveralls.io/repos/github/pichillilorenzo/deps-report/badge.svg?branch=master)](https://coveralls.io/github/pichillilorenzo/deps-report?branch=master)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](/LICENSE.txt)
[![Greenkeeper badge](https://badges.greenkeeper.io/pichillilorenzo/deps-report.svg)](https://greenkeeper.io/)
[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/LorenzoPichilli)
[![Donate to this project using Patreon](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/bePatron?u=9269604)

Generate reports about dependencies and dependents of your JavaScript/TypeScript files through an **AST**. It supports `import` and `require` statements.

Parsers used:
  - [flow-parser](https://www.npmjs.com/package/flow-parser) for `.js` files
  - [typescript](https://github.com/Microsoft/TypeScript) for `.ts` files


## Install

```
npm install -g deps-report
```

## Screenshots
![](https://drive.google.com/uc?authuser=0&id=1GHYVTXM6KSaAtjOvNqA-2Q-z5TKc-nQC&export=download)


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
  --no-color                                Display terminal output without colors
  -h, --help                                output usage information

Commands:

  find-dependencies [options] <glob> [otherGlobs...]

      Usage: find-dependencies [options] <glob> [otherGlobs...]
      Options:

        -c, --circular    Show if there are some circular dependencies
        --only-circular   Show only circular dependencies
        -h, --help        output usage information


  find-dependents [options] <glob> [otherGlobs...]

      Usage: find-dependents [options] <glob> [otherGlobs...]
      Options:

        -r, --root [root]   Root folder from where to start the search
        -c, --circular      Show if there are some circular dependencies
        --only-circular     Show only circular dependencies
        -h, --help          output usage information

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
 1) react, specifiers imported: default as React, Component
 2) ./logo.svg, specifiers imported: default as logo
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

tests/project-react-js-test/src/App.test.js, found 1 dependency:
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
 2) fs
 3) ./c/d.js, Circular Dependency
 4) Utilities/index.js
 5) UtilitiesRelativePath
 6) Utilities/utilityA.js
 7) Templates/main.js
 8) TemplatesMain
 9) MyPath
10) fs
11) ./e/b.js
12) ./c/d.js, Circular Dependency


$ deps-report -w tests/project-test/webpack.config.js find-dependencies --only-circular tests/project-test/a.js

tests/project-test/a.js, found 2 dependencies:
 1) ./c/d.js
 2) ./c/d.js


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
$ deps-report -jps find-dependencies -c tests/project-react-js-test/src/App.js

{
  "tests/project-react-js-test/src/App.js": {
    "absolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js",
    "files": 3,
    "dependencies": [
      {
        "importPath": "react",
        "importAbsolutePath": "react",
        "isCircularDependency": null,
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
        "isCircularDependency": false,
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
        "isCircularDependency": false,
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
 1) tests/project-react-js-test/src/App.test.js, specifiers imported: default as App
 2) tests/project-react-js-test/src/index.js, specifiers imported: default as App


$ deps-report -as find-dependents tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.js, found 2 dependents:
 1) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.test.js, specifiers imported: default as App
 2) /Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.js, specifiers imported: default as App


$ deps-report find-dependents tests/project-test/a1.ts

tests/project-test/a1.ts, found 0 dependents:
    No dependents found!


$ deps-report find-dependents -c -r tests/project-test tests/project-test/c/d.js

tests/project-test/c/d.js, found 4 dependents:
 1) tests/project-test/a.js, Circular Dependency
 2) tests/project-test/e/b.js
 3) tests/project-test/a.ts
 4) tests/project-test/b.ts


$ deps-report -es -w tests/project-test/webpack.config.js find-dependents -r tests/project-test/ tests/project-test/src/utilities/index.js tests/project-test/src/templates/main.js

tests/project-test/src/utilities/index.js, found 2 dependents:
 1) tests/project-test/a.js, specifiers imported: default as Utilities
 2) tests/project-test/a.ts, specifiers imported: default as Utilities

tests/project-test/src/templates/main.js, found 3 dependents:
 1) tests/project-test/a.js, specifiers imported: default as templates
 2) tests/project-test/src/utilities/index.js, specifiers imported: default as templates
 3) tests/project-test/a.ts, specifiers imported: default as templates
```

You can search also **images** and **css** files imported in your javascript files (such as in a React project):

```
$ deps-report -s find-dependents tests/project-react-js-test/src/logo.svg

tests/project-react-js-test/src/logo.svg, found 1 dependent:
 1) tests/project-react-js-test/src/App.js, specifiers imported: default as logo


$ deps-report find-dependents tests/project-react-js-test/src/App.css

tests/project-react-js-test/src/App.css, found 1 dependent:
 1) tests/project-react-js-test/src/App.js
```

JSON format example:

```
$ deps-report -jps find-dependents -c tests/project-react-js-test/src/App.js

{
  "tests/project-react-js-test/src/App.js": {
    "absolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js",
    "files": 2,
    "dependents": [
      {
        "filePath": "tests/project-react-js-test/src/App.test.js",
        "fileAbsolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.test.js",
        "importPath": "./App.js",
        "importAbsolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js",
        "isCircularDependency": false,
        "specifiers": [
          {
            "name": "App",
            "alias": "",
            "isDefault": true
          }
        ]
      },
      {
        "filePath": "tests/project-react-js-test/src/index.js",
        "fileAbsolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.js",
        "importPath": "./App.js",
        "importAbsolutePath": "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.js",
        "isCircularDependency": false,
        "specifiers": [
          {
            "name": "App",
            "alias": "",
            "isDefault": true
          }
        ]
      }
    ]
  }
}
```


## API Usage

```javascript
const depsReport = require('deps-report')

// find-dependencies command options

let optionsFindDependencies = {
  circular: false,              // if true, it will try to see if there are some circular dependencies with input files
  onlyCircular: false,          // if true, it will return only dependecies with circular dependency with input files
  parent: {
    excludeNodeModules: false,  // if true, it will exclude all node modules
    json: false,                // used only for CLI output
    pretty: false,              // used only for CLI output
    absPath: false,             // used only for CLI output
    color: false,               // used only for CLI output
    webpackConfig: 'tests/project-test/webpack.config.js', // used to resolve module aliases
    specifiers: false           // if true, it will populate the specifiers imported by the dependency
  } 
}

depsReport.findDependencies(["tests/project-test/a.js"], optionsFindDependencies)


// find-dependents command options

let optionsFindDependents = {
  root: 'tests/project-test',   // Root folder from where to start the search of dependents
  circular: false,              // if true, it will try to see if there are some circular dependencies with input files
  onlyCircular: false,          // if true, it will return only dependents with circular dependency with input files
  parent: {
    excludeNodeModules: false,  // if true, it will exclude all node modules
    json: false,                // used only for CLI output
    pretty: false,              // used only for CLI output
    absPath: false,             // used only for CLI output
    color: false,               // used only for CLI output
    webpackConfig: 'tests/project-test/webpack.config.js', // used to resolve module aliases
    specifiers: false           // if true, it will populate the specifiers imported by the dependent
  } 
}

depsReport.findDependents(["tests/project-test/src/templates/*.js", "tests/project-test/src/utilities/*.js"], optionsFindDependents)
```

## Support

### Feature request/enhancement
For feature requests/enhancement, create an issue!

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.me/LorenzoPichilli)
[![Become a Patron](https://img.shields.io/badge/-Become%20a%20Patron!-red.svg?style=for-the-badge)](https://www.patreon.com/bePatron?u=9269604)


## License

_MIT License_