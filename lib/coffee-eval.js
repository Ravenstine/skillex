'use strict';

const CoffeeScript = require('coffeescript');
const vm           = require('vm');

module.exports = (coffeeSource, request, response) => {
  if(!coffeeSource){ return; }
  let src     = CoffeeScript.compile(coffeeSource, {bare: true});
  let script  = new vm.Script(src)

  // If there are slots in the request, let's make a
  // nice little slots object to add to our context.
  let slots = {};
  if(request && request.request && request.request.type == "IntentRequest"){
    let intentSlots = (((request.request || {}).intent || {}).slots || {});
    Object.keys(intentSlots).forEach((slotName) => {
      let slot         = intentSlots[slotName];
      slots[slot.name] = slot.value;
    });
  }

  let ctx     = {
    request: request, 
    response: response,
    attributes: (response || {}).sessionAttributes || {},
    slots: slots
  };

  Object.assign(ctx, ctx.attributes);
  let context = new vm.createContext(ctx);

  return script.runInNewContext(context);
}

