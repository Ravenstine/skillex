'use strict';

const speak      = require('./speak');
const reprompt   = require('./reprompt');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const audio      = require('./audio');
const webRequest = require('./web-request');
const intents    = require('./intents');
const _events    = require('./events');
const assign     = require('./assign');
const condition  = require('./condition');
const card       = require('./card');
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

  // speak:
  speak(label.speak, context);

  // audio:
  audio(label.audio, context);

  // card:
  card(label.card, context);

  // ask:
  // if the label has a choice defined and we haven't
  // already used go to outside of the choice
  if(label.hasOwnProperty('ask')){
    speak(label.ask, context);
    let repromptValue = label.reprompt || label.ask;
    reprompt(repromptValue, context);
    // 👆 the default reprompt is the choice dialog, unless
    // `reprompt: ` is specified or cleared when `reprompt: false`
    context.responseBody.shouldEndSession = false;
    // if we are asking a question, we don't want to
    // continue on to react to the utterances set in
    // the label.  that should only happen in the next
    // request when the question is answered.
    return Promise.resolve();
  }

  // go to:
  if(label.hasOwnProperty('go to')) {
    context.sessionAttributes.LABEL = label['go to'];
  }

  // swallow pill:
  if(label.hasOwnProperty('swallow pill')){
    context.sessionAttributes.PILL  = label['swallow pill'];
    context.sessionAttributes.LABEL = null;
  }

  // events:
  _events(label.events, context);

  // utterances:
  intents(label.intents, context);

  // condition:
  condition(label.condition, context);

  return Promise.resolve();

  } catch (err) {
    return Promise.reject(err);
  }

  }).catch((err) => {
    console.error(err ? err.stack : err);
    fs.appendFile('log/error.log', (err.stack || JSON.stringify(err)), 'utf8', ()=>{});
    let dialog = err.speak || label['error dialog'] || "Looks like I overdosed!";
    speak(dialog, context);
    context.sessionAttributes.LABEL = null; // abort!
    context.sessionAttributes.reset(); // act like nothin's happened
    return Promise.resolve();
    // 👆 We resolve so we can continue to deliver a response.
    // if we don't, the skill will block.
  });

}

