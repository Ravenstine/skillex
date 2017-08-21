'use strict';

const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const speak      = require('./builders/speak');
const assign     = require('./builders/assign');
const condition  = require('./builders/condition');
const restore    = require('./builders/restore');

// Used by anything that's a reaction to user interaction
// such as utterances/intents and events(i.e. request types).
// Is purposedly more limited than labels in order to 
// prevent unnecessary complexity.

module.exports = (action, context) => {

  if(!action) { return; }

  // restore:
  restore(action.restore, context);

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
    context.navigator.swallowPill(action['swallow pill']);
    return;
  }

  // go to:
  if(action.hasOwnProperty('go to')) {
    context.navigator.goTo(action['go to']);
  }

  // condition:
  if(action.condition){
    condition(action.condition, context);
  }

}

