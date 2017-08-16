'use strict';

const coffeeEval = require('./coffee-eval');
const moment = require('moment');
// require('moment/locale/de');

const Entities    = require('html-entities').AllHtmlEntities;
const entities    = new Entities();

module.exports = (string, context, options) => {
  if(!string) {return '';}
  // parses es2015-style template strings
  return string.replace(/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, (match, p1) => {
    let value = coffeeEval(p1, context);
    let result = '';
    if(value == void(0) || value === NaN){
      return '';
    } else if (Object.prototype.toString.call(value) === '[object Date]') {
      result = moment(value).format('h m a [on] MMMM D YYYY');
    } else {
      // we're going to assume that encoded entities 
      // are of no value in an alexa skill.
      //
      // this is the best place to decode because
      // variables besides the web response may
      // also contain entities.
      if(typeof value === 'string'){
        result = entities.decode(value);
      } else {
        result = value;
      }
    }
    if(options && options.uriEncode){
      // needed for web requests where the
      // url needs to be string interpolated
      result = encodeURIComponent(result);
    }
    return result;
  });
}

