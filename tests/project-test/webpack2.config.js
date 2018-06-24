// @flow
const path = require("path")

module.exports = {
  resolve: {
    alias: {
      Utilities: path.join('src','utilities'),
      UtilitiesRelativePath: path.join('src','utilities', 'relative.js'),
      Templates: path.join('src','templates'),
      TemplatesMain: path.join('src','templates', 'main.js'),
      TemplatesMain$: path.join('src','templates', 'main.js'),
      MyPath: 'path'
    },
    modules: [
      path.resolve(__dirname),
      'node_modules'
    ]
  }
};