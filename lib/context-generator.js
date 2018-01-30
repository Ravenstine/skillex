'use strict';

const Navigator = require('./navigator');
const SlotValue = require('./slot-value');
const getProp   = require('keypather/get');
const setProp   = require('keypather/set');

module.exports = (request, ctx, scenes) => {
  request  = Object.assign({
    request: {},
    session: {}
  }, request || {});

  const response = {
    version: "1.0",
    sessionAttributes: Object.assign({
      STATE: 'entrypoint',
      ATTRIBUTES: {}
    }, ((request.session || {}).attributes || {})),
    response: {
      shouldEndSession: true
    }
  }

  scenes = scenes || {};

  const context = {
    context: ctx,
    request: request,
    requestBody: request.request,
    response: response,
    responseBody: response.response,
    attributes: response.sessionAttributes.ATTRIBUTES,
    session: request.session,
    sessionAttributes: response.sessionAttributes,
    slots: {},
    temp: {},
  };
  
  context.get       = function(key) { 
    return require('keypather/get')(context, key);
  };
  context.getWithDefault  = function(key, _default) { return getProp(context, key) || _default; };
  context.set             = function(key, value) { return setProp(context, key, value); };
  context.setUnlessExists = function(key, value) { 
    if(!context.get(key)) return context.set(key, value);
  }
  context.del       = function(key) { return dotProp.delete(context, key); };
  context.coalesce  = function(){
    let coalesced = {};
    Object.assign(coalesced, context);
    Object.assign(coalesced, context.attributes);
    Object.assign(coalesced, context.temp);
    Object.assign(coalesced, context.slots);
  }
  context.navigator = new Navigator(scenes, context); 

  // If there are slots in the request, let's make a
  // nice little slots object to add to our context.
  if(context.get('requestBody.type') == 'IntentRequest'){
    let intentSlots = context.getWithDefault('requestBody.intent.slots', {});
    Object.keys(intentSlots).forEach(slotName => context.slots[slotName] = new SlotValue(intentSlots[slotName]));
  }

  return context;
}

