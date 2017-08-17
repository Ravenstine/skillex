'use strict';

let respond    = require('./respond');

module.exports = (intents, context) => {

  if(!intents) { return; }

  let intentName = (context.requestBody.intent || {})['name'];

  let intent   = intents[intentName];

  if(!intent){
    intent     = intents['?'] || {}; // choose wildcard intent if no intent
  }

  respond(intent, context);
}

