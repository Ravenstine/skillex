'use strict';

const Navigator = require('./navigator');
const SlotValue = require('./slot-value');
const dotProp   = require('dot-prop');

module.exports = (request, pills) => {
  request  = Object.assign({
    request: {},
    session: {}
  }, request || {});

  const response = {
    version: "1.0",
    sessionAttributes: Object.assign({
      PILL: 'entrypoint',
      ATTRIBUTES: {}
    }, ((request.session || {}).attributes || {})),
    response: {
      shouldEndSession: true
    }
  }

  pills = pills || {};

  const context = {
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
  context.navigator = new Navigator(pills, context);
  context.get       = function(key) { return dotProp.get(context, key); };
  context.getWithDefault = function(key, _default) { return dotProp.get(context, key) || _default; };
  context.set       = function(key, value) { return dotProp.set(context, key, value); };
  context.setUnlessExists = function(key, value) { 
    return !context.get(key) ? context.set(key, value) : null;
  }
  context.del       = function(key) { return dotProp.delete(context, key); };

  // If there are slots in the request, let's make a
  // nice little slots object to add to our context.
  if(context.get('requestBody.type') == 'IntentRequest'){
    let intentSlots = context.getWithDefault('requestBody.intent.slots', {});
    Object.keys(intentSlots).forEach(slotName => context.slots[slotName] = new SlotValue(intentSlots[slotName]));
  }

  return context;
}

