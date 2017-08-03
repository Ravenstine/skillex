'use strict';

let peelLabel  = require('./label-peeler');

module.exports = (choice, request, response) => {
  if(!choice) { return; }

  let intentName = (request.request.intent || {})['name'] || request.request.type;

  let decision   = (choice.intents || {})[intentName] || {};

  peelLabel(decision, request, response);
}

