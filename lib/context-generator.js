'use strict';

const Navigator = require('./navigator');
const SlotValue = require('./slot-value');

module.exports = (request, pills) => {
  request  = Object.assign({
    request: {},
    session: {}
  }, request || {});

  let response = {
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

  let context = {
    request: request,
    requestBody: request.request,
    response: response,
    responseBody: response.response,
    attributes: response.sessionAttributes.ATTRIBUTES,
    session: request.session,
    sessionAttributes: response.sessionAttributes,
    slots: {},
    temp: {}
  };
  context.navigator = new Navigator(pills, context);

  // If there are slots in the request, let's make a
  // nice little slots object to add to our context.
  if(request && request.request && request.request.type == "IntentRequest"){
    let intentSlots = (((request.request || {}).intent || {}).slots || {});
    Object.keys(intentSlots).forEach((slotName) => {
      context.slots[slotName] = new SlotValue(intentSlots[slotName]);
    });
  }

  return context;
}

