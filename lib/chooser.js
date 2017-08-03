'use strict';

let peelLabel  = require('./label-peeler');

module.exports = (choice, request, response) => {
  if(!choice) { return; }

  let intentName = (request.request.intent || {})['name'] || request.request.type;

  let decision   = (choice.intents || {})[intentName] || {};

  if(decision.hasOwnProperty('go to')) {
    response.sessionAttributes.LABEL = decision['go to'];
  }

  // peelLabel(decision, request, response);
}

