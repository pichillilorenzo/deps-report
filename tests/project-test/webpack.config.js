// @flow
const path = require("path")

module.exports = {
  resolve: {
    alias: {
      Utilities: path.resolve(__dirname, path.join('src','utilities')),
      UtilitiesRelativePath: path.join('src','utilities', 'relative.js'),
      Templates: path.resolve(__dirname, path.join('src','templates')),
      TemplatesMain: path.resolve(__dirname, path.join('src','templates', 'main.js')),
      TemplatesMain$: path.resolve(__dirname, path.join('src','templates', 'main.js')),
      MyPath: 'path'
    }
  }
};