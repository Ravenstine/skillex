'use strict';

let peelLabel  = require('./label-peeler');
let speak      = require('./speech-writer');

module.exports = (choice, request, response) => {
  if(!choice) { return; }

  let intentName = (request.request.intent || {})['name'] || request.request.type;

  let decision   = (choice.intents || {})[intentName] || {};

  // dialog:
  speak(response, decision.dialog);

  // go to:
  if(decision.hasOwnProperty('go to')) {
    response.sessionAttributes.LABEL = decision['go to'];
  }

}

