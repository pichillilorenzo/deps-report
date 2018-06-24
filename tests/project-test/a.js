// @flow

import fs, { readFileSync } from 'fs'

import d from './c/d.js'

// $FlowFixMe
import Utilities from 'Utilities'
// $FlowFixMe
import UtilitiesRelativePath from 'UtilitiesRelativePath'
// $FlowFixMe
import utilityA from 'Utilities/utilityA'
// $FlowFixMe
import templates from 'Templates'
// $FlowFixMe
import templatesMain from 'TemplatesMain'
// $FlowFixMe, this is a webpack resolve error
import TemplatesMainJS from 'TemplatesMain/main.js'
// $FlowFixMe
import MyPath from 'MyPath'

const fs1 = require('fs'),
  b_folder_e = require('./e/b'),
  d1 = require('./c/d.js')

module.exports = {}