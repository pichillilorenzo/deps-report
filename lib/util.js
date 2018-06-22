// @flow

const typescript = require('typescript')

function flowTraverseAST(key/*: string*/, values/*: Array<any>*/, doc/* : Object*/, wild/*: boolean*/=false, return_parent/*: Object | boolean*/=false, results/*: Array<any>*/=[])/*: Array<any>*/{

  if (doc) {
    if (Array.isArray(doc)) {
      for (let d of doc) {
        flowTraverseAST(key, values, d, wild, (return_parent) ? doc : false, results)
      }
    }

    if (!Array.isArray(doc) && typeof doc == "object"){
      for (let k in doc) {
        let v = doc[k]
        if ( values && values.indexOf(v) >= 0 && ( key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) ) {
          results.push((!return_parent) ? doc : return_parent)
        }
        else if (!values && key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) {
          results.push((!return_parent) ? doc : return_parent)
        }
        else if (!Array.isArray(v)) {
          flowTraverseAST(key, values, v, wild, (return_parent) ? doc : false, results)
        }
        else if (Array.isArray(v)) {
          for (let d of v) {
            flowTraverseAST(key, values, d, wild, (return_parent) ? doc : false, results)
          }
        }
      }
    }
  }

  return results
}

function typescriptTraverseAST(key/*: string*/, values/*: Array<any>*/, doc/* : Object*/, wild/*: boolean*/=false, return_parent/*: Object | boolean*/=false, results/*: Array<any>*/=[])/*: Array<any>*/{

  if (doc) {
    for (let k in doc) {
      let v = doc[k]
      if ( values && values.indexOf(v) >= 0 && ( key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) ) {
        results.push((!return_parent) ? doc : return_parent)
      }
      else if (!values && key == k || ( wild && k.toLowerCase().indexOf(key.toLowerCase()) >= 0 ) ) {
        results.push((!return_parent) ? doc : return_parent)
      }
    }  

    typescript.forEachChild(doc, (node) => {typescriptTraverseAST(key, values, node, wild, (return_parent) ? doc : false, results)})
  }

  return results
}

module.exports = {
  flowTraverseAST,
  typescriptTraverseAST
}