'use strict';

const CoffeeScript = require('coffeescript');
const vm           = require('vm');
const _            = require('lodash');
const fetch        = require('node-fetch');
const SkillexObject = require('./object');

module.exports = (coffeeSource, context, scope) => {
  if(!coffeeSource) return Promise.resolve();
  return new Promise((resolve, reject) => {

    let src     = CoffeeScript.compile(coffeeSource, {bare: true});
    let script  = new vm.Script(src)

    let ctx = {
      _, 
      fetch,
      SkillexObject
    };

    Object.assign(ctx, context.coalesce());

    if(scope) Object.assign(ctx, scope);

    let vmContext = new vm.createContext(ctx);

    try {
      let output = script.runInNewContext(vmContext);
      return resolve(output);
    } catch(err) {
      return reject(err);
    }

  });

}

