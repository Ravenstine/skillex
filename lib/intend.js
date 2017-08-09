'use strict';

let peelLabel    = require('./label-peeler');
let speak        = require('./speak');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const assign     = require('./assign');
const condition  = require('./condition');

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

  // assign:
  assign(decision.assign, context);

  // dialog:
  speak(decision.dialog, context);

  // go to:
  if(decision.hasOwnProperty('go to')) {
    context.attributes.LABEL = decision['go to'];
  }

  // condition:
  if(decision.condition){
    condition(decision.condition, context);
  }

}

