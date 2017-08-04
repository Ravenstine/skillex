'use strict';

const speak      = require('./speak');
const reprompt   = require('./reprompt');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (label, request, response) => {

  // script:
  coffeeEval(label.script || label.eval, request, response);

  // Append dialog text to repsonse output speech text.
  speak(response, evalString(label.dialog, request, response));

  // go to pill:
  if(label.hasOwnProperty('go to pill')){
    response.sessionAttributes.PILL  = label['go to pill'];
    response.sessionAttributes.LABEL = null;
    return;
  }

  // go to:
  if(label.hasOwnProperty('go to')) {
    response.sessionAttributes.LABEL = label['go to'];
    return;
  } else if (!label.choice) {
    // If a choice is defined, the session is continuing
    // and we will need to come back to this label if a
    // user responds with an intent, so only allow the
    // label to change if there's no choice.
    response.sessionAttributes.LABEL = label['go to'];
  }

  // choice:
  // if the label has a choice defined and we haven't
  // already used go to outside of the choice
  if(!label.hasOwnProperty('go to') && label.choice){
    speak(response, evalString(label.choice.dialog, request, response));
    let repromptString = label.choice.reprompt || label.choice.dialog;
    reprompt(response, evalString(repromptString, request, response));
    // 👆 the default reprompt is the choice dialog, unless
    // `reprompt: ` is specified or cleared when `reprompt: false`
    response.response.shouldEndSession = false;
  }

}

