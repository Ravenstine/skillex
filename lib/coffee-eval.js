'use strict';

const CoffeeScript = require('coffeescript');

module.exports = (coffeeSource, request, response) => {
  if(!coffeeSource){ return; }
  let src = CoffeeScript.compile(coffeeSource, {bare: true});
  return eval(src);
}

