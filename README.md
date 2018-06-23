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

`npm install -g deps-report`


## CLI Usage

```
Usage: deps-report [options] [command]

Options:

  -V, --version                          output the version number
  --json                                 Output results in JSON format
  --pretty                               Pretty-print JSON output (implies --json)
  --abs-path                             Print absolute path of dependencies/dependents
  --exclude-node-modules                 Don't consider node_modules dependencies
  -h, --help                             output usage information

Commands:

  find-dependencies [inputFile]

      Usage: find-dependencies [options] [inputFile]
      Options:

        -h, --help  output usage information


  find-dependents [options] [inputFile]

      Usage: find-dependents [options] [inputFile]
      Options:

        -r, --root [root]  Root folder from where to start the search
        -h, --help         output usage information

```


## Examples find-dependencies

```
$ deps-report find-dependencies tests/project-react-js-test/src/App.js

react
./logo.svg
./App.css


$ deps-report --json --pretty find-dependencies tests/project-react-js-test/src/App.js
[
  "react",
  "./logo.svg",
  "./App.css"
]

$ deps-report --json --pretty --exclude-node-modules find-dependencies tests/project-react-js-test/src/App.js
[
  "./logo.svg",
  "./App.css"
]

$ deps-report --json --pretty --abs-path find-dependencies tests/project-react-js-test/src/App.js
[
  "react",
  "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/logo.svg",
  "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.css"
]

$ deps-report --json --pretty --exclude-node-modules --abs-path find-dependencies tests/project-react-js-test/src/App.js
[
  "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/logo.svg",
  "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.css"
]

$ deps-report find-dependencies tests/project-test/a1.ts

fs
./b.ts
./e/b.js


$ deps-report lorenzo$ deps-report --json --pretty find-dependencies tests/project-test/a1.ts
[
  "fs",
  "fs",
  "./b.ts",
  "./e/b.js"
]
```

## Examples find-dependents

```
$ deps-report find-dependents tests/project-react-js-test/src/App.js

tests/project-react-js-test/src/App.test.js
tests/project-react-js-test/src/index.js


$ deps-report --json --pretty find-dependents tests/project-react-js-test/src/App.js
[
  "tests/project-react-js-test/src/App.test.js",
  "tests/project-react-js-test/src/index.js"
]

$ deps-report --json --pretty --abs-path find-dependents tests/project-react-js-test/src/App.js
[
  "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/App.test.js",
  "/Users/lorenzo/Desktop/deps-report/tests/project-react-js-test/src/index.js"
]

$ deps-report find-dependents tests/project-test/a1.ts

No dependents found!


$ deps-report --json --pretty find-dependents --root tests/project-test tests/project-test/c/d.js
[
  "tests/project-test/a.js",
  "tests/project-test/e/b.js",
  "tests/project-test/b.ts"
]
```