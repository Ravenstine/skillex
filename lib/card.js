'use stict';

const evalString = require('./eval-string');

function evalCardValues(obj, context) {
  Object.keys(obj).forEach((key) => {
    let value = obj[key];
    if(typeof value === 'string'){
      obj[key] = evalString(value, context);
    } else if (Object.prototype.toString.call(o) === '[object Object]') {
      obj[key] = evalCardValues(value, context);
    }
  });
}

module.exports = (card, context) => {
  if(!card){ return; }
  context.response.card = Object.assign({type: 'Simple'}, card);
  evalCardValues(context.response.card, context);
}

