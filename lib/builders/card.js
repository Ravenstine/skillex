'use stict';

const evalString = require('../eval-string');

function evalCardValues(obj, context) {
  Object.keys(obj).forEach((key) => {
    let value = obj[key];
    if(typeof value === 'string'){
      obj[key] = forceHTTPS(evalString(value, context));
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      obj[key] = evalCardValues(value, context);
    }
  });
  return obj;
}

function forceHTTPS(value){
  if(value){
    return value.replace(/^\s*http:\/\//, 'https://');
  }
}

module.exports = (card, context) => {
  if(!card){ return; }
  context.responseBody.card = Object.assign({type: 'Simple'}, card);
  evalCardValues(context.responseBody.card, context);
}

