'use strict';

const CoffeeScript = require('coffeescript');
const vm           = require('vm');

module.exports = (coffeeSource, context) => {
  if(!coffeeSource){ return; }
  let src     = CoffeeScript.compile(coffeeSource, {bare: true});
  let script  = new vm.Script(src)

  let ctx = {};

  Object.assign(ctx, context);
  Object.assign(ctx, context.attributes);

  let vmContext = new vm.createContext(ctx);

  return script.runInNewContext(vmContext);
}

