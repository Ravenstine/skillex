'use strict';

const coffeeEval = require('./coffee-eval');
const moment = require('moment');
// require('moment/locale/de');

const Entities    = require('html-entities').AllHtmlEntities;
const entities    = new Entities();

module.exports = (string, context) => {
  if(!string) {return '';}
  return string.replace(/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, (match, p1) => {
    let value = coffeeEval(p1, context);
    if(value == void(0) || value === NaN){
      return '';
    } else if (Object.prototype.toString.call(value) === '[object Date]') {
      return moment(value).format('h m a [on] MMMM D YYYY');
    } else {
      // we're going to assume that encoded entities 
      // are of no value in an alexa skill.
      //
      // this is the best place to decode because
      // variables besides the web response may
      // also contain entities.
      if(typeof value === 'string'){
        return entities.decode(value);
      } else {
        return value;
      }
      
    }
  });
}

