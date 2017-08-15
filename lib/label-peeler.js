'use strict';

const speak      = require('./speak');
const reprompt   = require('./reprompt');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const audio      = require('./audio');
const webRequest = require('./web-request');
const intend     = require('./intend');
const assign     = require('./assign');
const condition  = require('./condition');
const fs         = require('fs');

module.exports = (label, context) => {

  // web request:
  return webRequest(label['web request'], context).then(() => {

  try {

  // script:
  coffeeEval(label.script, context);

  // temp:
  assign(context.temp, label.temp, context);

  // assign:
  assign(context.attributes, label.assign, context);

  // Append dialog text to repsonse output speech text.
  speak(label.dialog, context);

  // audio:
  audio(label.audio, context);

  // go to pill:
  if(label.hasOwnProperty('go to pill')){
    context.sessionAttributes.PILL  = label['go to pill'];
    context.sessionAttributes.LABEL = null;
    return;
  }

  // go to:
  // if(label.hasOwnProperty('go to')) {
  //   context.sessionAttributes.LABEL = label['go to'];
  //   return;
  // } else if (!label.choice) {
  //   // If a choice is defined, the session is continuing
  //   // and we will need to come back to this label if a
  //   // user responds with an intent, so only allow the
  //   // label to change if there's no choice.
  //   context.sessionAttributes.LABEL = label['go to'];
  // }
  if(!label.choice && label.hasOwnProperty('go to')) {
    context.sessionAttributes.LABEL = label['go to'];
  }

  // intents:
  // this is kind of a weird one because
  // any `go to:`s inside the intents could
  // ruin the state if we have a `choice:`.
  // gotta figure out what to do about this.
  intend(label.intents, context);

  // choice:
  // if the label has a choice defined and we haven't
  // already used go to outside of the choice
  if(label.choice){
    speak(label.choice.dialog, context);
    let repromptString = label.choice.reprompt || label.choice.dialog;
    reprompt(repromptString, context);
    // 👆 the default reprompt is the choice dialog, unless
    // `reprompt: ` is specified or cleared when `reprompt: false`
    context.payload.shouldEndSession = false;
  }

  // condition:
  if(label.condition){
    condition(label.condition, context);
  }

  // CLEANUP STATE
  if(!context.sessionAttributes.hasChanged('LABEL')){
    context.sessionAttributes.LABEL = null;
  };
  if(!context.sessionAttributes.hasChanged('LABEL') && !context.sessionAttributes.hasChanged('PILL')){
    context.sessionAttributes.PILL = null;
  };

  return Promise.resolve();

  } catch (err) {
    return Promise.reject(err);
  }

  }).catch((err) => {
    console.error(err ? err.stack : err);
    fs.appendFile('log/error.log', (err.stack || JSON.stringify(err)), 'utf8', ()=>{});
    let dialog = err.dialog || label['error dialog'] || "Looks like I overdosed!";
    speak(dialog, context);
    context.sessionAttributes.LABEL = null; // abort!
    return Promise.resolve();
    // 👆 We resolve so we can continue to deliver a response.
    // if we don't, the skill will block.
  });

}

