'use strict';

const speak      = require('./speak');
const reprompt   = require('./reprompt');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (label, context) => {

  // script:
  coffeeEval(label.script || label.eval, context);

  // Append dialog text to repsonse output speech text.
  speak(evalString(label.dialog, context), context);

  // go to pill:
  if(label.hasOwnProperty('go to pill')){
    context.attributes.PILL  = label['go to pill'];
    context.attributes.LABEL = null;
    return;
  }

  // go to:
  if(label.hasOwnProperty('go to')) {
    context.attributes.LABEL = label['go to'];
    return;
  } else if (!label.choice) {
    // If a choice is defined, the session is continuing
    // and we will need to come back to this label if a
    // user responds with an intent, so only allow the
    // label to change if there's no choice.
    context.attributes.LABEL = label['go to'];
  }

  // choice:
  // if the label has a choice defined and we haven't
  // already used go to outside of the choice
  if(!label.hasOwnProperty('go to') && label.choice){
    speak(evalString(label.choice.dialog, context), context);
    let repromptString = label.choice.reprompt || label.choice.dialog;
    reprompt(evalString(repromptString, context), context);
    // 👆 the default reprompt is the choice dialog, unless
    // `reprompt: ` is specified or cleared when `reprompt: false`
    context.payload.shouldEndSession = false;
  }

}

