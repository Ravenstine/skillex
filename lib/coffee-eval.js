'use strict';

const CoffeeScript = require('coffeescript');
const vm           = require('vm');
const _            = require('lodash');
const fetch        = require('node-fetch');

module.exports = (coffeeSource, context, scope) => {
  if(!coffeeSource) return;
  let src     = CoffeeScript.compile(coffeeSource, {bare: true});
  let script  = new vm.Script(src)

  let ctx = {_: _, fetch: fetch};

  Object.assign(ctx, context.coalesce());

  if(scope) Object.assign(ctx, scope);

  let vmContext = new vm.createContext(ctx);

  try {
    return script.runInNewContext(vmContext);
  } catch(err) {
    console.warn(err);
    return;
  }

}

