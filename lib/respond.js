'use strict';

const speak      = require('./speak');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const assign     = require('./assign');
const condition  = require('./condition');

// Used by anything that's a reaction to user interaction
// such as utterances/intents and events(i.e. request types).
// Is purposedly more limited than labels in order to 
// prevent unnecessary complexity.

module.exports = (action, context) => {

  if(!action) { return; }

  // script:
  coffeeEval(action.script, context);

  // temp:
  assign(context.temp, action.temp, context);

  // assign:
  assign(context.attributes, action.assign, context);

  // speech:
  speak(action.speak, context);

  // swallow pill:
  if(action.hasOwnProperty('swallow pill')){
    context.sessionAttributes.PILL  = action['swallow pill'];
    return;
  }

  // go to:
  if(action.hasOwnProperty('go to')) {
    context.sessionAttributes.LABEL = action['go to'];
  }

  // condition:
  if(action.condition){
    condition(action.condition, context);
  }

}

