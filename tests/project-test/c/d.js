// @flow

const fs = require('fs'),
  // $Ignore, ../b.js doesn't exist, only ../b.ts so it is wrong in this case
  b = require('../b'),
  a = require('../a')

module.exports = {
  d1: 1,
  d2: 2
}