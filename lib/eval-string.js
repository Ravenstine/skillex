'use strict';

let coffeeEval = require('./coffee-eval');

module.exports = (string, context) => {
  if(!string) {return '';}

  return string.replace(/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, (match, p1) => {
    let value = coffeeEval(p1, context);
    if(value == void(0) || value === NaN){
      return '';
    } else {
      return value;
    }
  });
}

