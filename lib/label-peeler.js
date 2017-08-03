'use strict';

const speak      = require('./speech-writer');
const coffeeEval = require('./coffee-eval');

module.exports = (label, request, response) => {
  // Append dialog text to repsonse output speech text.
  if(label.dialog){
    speak(response, label.dialog);
  }

  // eval:
  coffeeEval(label.eval, request, response);

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
    speak(response, label.choice.dialog);
    response.response.shouldEndSession = false;
  }

}

