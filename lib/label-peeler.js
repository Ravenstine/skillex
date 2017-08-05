'use strict';

const speak      = require('./speak');
const reprompt   = require('./reprompt');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const audio      = require('./audio');
const webRequest = require('./web-request');
const intend     = require('./intend');

module.exports = (label, context) => {

  // web request:
  return webRequest(label['web request'], context).then(() => {

  // script:
  coffeeEval(label.script || label.eval, context);

  // Append dialog text to repsonse output speech text.
  speak(evalString(label.dialog, context), context);

  // audio:
  audio(label.audio, context);

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

  // intents:
  intend(label.intents, context);

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

  return Promise.resolve();

  }).catch(() => {
    let dialog = label['error dialog'] || "Looks like I overdosed!";
    speak(evalString(dialog, context), context);
    context.attributes.LABEL = null; // abort!
    return Promise.resolve();
    // 👆 We resolve so we can continue to deliver a response.
    // if we don't, the skill will block.
  });

}

