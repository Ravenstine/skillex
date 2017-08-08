'use strict';

const coffeeEval = require('./coffee-eval');

module.exports = (a, b, context) => {
  if(!a || !b){ return; }
  Object.keys(b).forEach(k => {
    let aVal = a[k];
    let bVal = b[k];
    let stringVal;

    if(typeof bVal === 'object') {
      stringVal = JSON.stringify(object);
    } else if (typeof bVal === 'string'){
      if(bVal.match(/^[\*|\=|\+|\-|\/|\%|\&|\^|\||\<|\>]+$/)){ 
        // if value s only an operator (e.x ++, --)
        debugger
        console.log(`a['${k}']${bVal}`)
        stringVal = `a['${k}']${bVal}`;
      } else {
        stringVal = bVal;
      }
    } else {
      stringVal = bVal;
    }
    

    let contextClone = Object.assign({}, context);

    contextClone.a   = a;
    contextClone.b   = b;
    debugger
    a[k] = coffeeEval(stringVal, contextClone);

  })
}

