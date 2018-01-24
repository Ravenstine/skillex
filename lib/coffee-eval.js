'use strict';

const CoffeeScript = require('coffeescript');
const vm           = require('vm');
const _            = require('lodash');

module.exports = (coffeeSource, context, scope) => {
  if(!coffeeSource) return;
  let src     = CoffeeScript.compile(coffeeSource, {bare: true});
  let script  = new vm.Script(src)

  let ctx = {_: _};

  Object.assign(ctx, context);
  Object.assign(ctx, context.attributes);
  Object.assign(ctx, context.temp);
  Object.assign(ctx, context.slots);

  if(scope) Object.assign(ctx, scope);

  let vmContext = new vm.createContext(ctx);

  try {
    return script.runInNewContext(vmContext);
  } catch(err) {
    console.warn(err);
    return;
  }

}

