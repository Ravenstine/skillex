'use strict';

let peelLabel    = require('./label-peeler');
let speak        = require('./speak');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (choice, request, response) => {
  if(!choice) { return; }

  let intentName = (request.request.intent || {})['name'] || request.request.type;

  let decision   = (choice.intents || {})[intentName] || {};

  // script:
  coffeeEval(decision.script, request, response);

  // dialog:
  speak(response, evalString(decision.dialog, request, response));

  // go to:
  if(decision.hasOwnProperty('go to')) {
    response.sessionAttributes.LABEL = decision['go to'];
  }

}

