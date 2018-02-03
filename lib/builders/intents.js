'use strict';

const speak    = require('./speak');

module.exports = (intents, context) => {

  if(!intents) { return; }

  let intentName = (context.requestBody.intent || {})['name'];

  let intent   = intents[intentName];

  if(!intent) intent = intents['?'] || {}; // choose wildcard intent if no intent

  speak(intent.say, context); // say:

  context.navigator.navigate(intent);
}

