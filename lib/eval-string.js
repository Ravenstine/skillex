'use strict';

const coffeeEval = require('./coffee-eval');
const moment = require('moment');
// require('moment/locale/de');
// console.log(moment.locale()); // cs

module.exports = (string, context) => {
  if(!string) {return '';}

  return string.replace(/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, (match, p1) => {
    let value = coffeeEval(p1, context);
    if(value == void(0) || value === NaN){
      return '';
    } else if (Object.prototype.toString.call(value) === '[object Date]') {
      return moment(value).format('h m a [on] MMMM D YYYY');
    } else {
      return value;
    }
  });
}

