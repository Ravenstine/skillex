'use strict';

let peelLabel    = require('./label-peeler');
let speak        = require('./speak');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (choice, context) => {

  if(!choice) { return; }

  let request    = context.request.request;

  let intentName = (request.intent || {})['name'] || request.type;

  let decision   = (choice.intents || {})[intentName] || {};

  // script:
  coffeeEval(decision.script, context);

  // dialog:
  speak(evalString(decision.dialog, context), context);

  // go to:
  if(decision.hasOwnProperty('go to')) {
    context.attributes.LABEL = decision['go to'];
  }

}

