'use strict';

let peelLabel    = require('./label-peeler');
let speak        = require('./speak');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (intents, context) => {

  if(!intents) { return; }

  let request    = context.request.request;

  // treat the request type as an intent name if there is no intent
  let intentName = (request.intent || {})['name'] || request.type;

  let decision   = intents[intentName];

  if(!decision){
    decision     = intents['?'] || {}; // choose wildcard intent if no decision
  }

  // script:
  coffeeEval(decision.script, context);

  // dialog:
  speak(evalString(decision.dialog, context), context);

  // go to:
  if(decision.hasOwnProperty('go to')) {
    context.attributes.LABEL = decision['go to'];
  }

}

