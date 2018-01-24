'use strict';

const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const speak      = require('./builders/speak');
const reprompt   = require('./builders/reprompt');
const audio      = require('./builders/audio');
const intents    = require('./builders/intents');
const card       = require('./builders/card');
const restore    = require('./builders/restore');

module.exports = (label, context) => {
  if(!label){ return Promise.resolve(); }
  // restore:
  restore(label.restore, context);

  try {

  // script:
  coffeeEval(label.script, context);

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
    // context.responseBody.shouldEndSession = false;
    context.navigator.wait();
    // if we are asking a question, we don't want to
    // continue on to react to the utterances set in
    // the label.  that should only happen in the next
    // request when the question is answered.
    return Promise.resolve();
  }

  // go to:
  if(label.hasOwnProperty('go to')) {
    context.navigator.goTo(label['go to']);
  }

  // swallow pill:
  if(label.hasOwnProperty('swallow pill')){
    context.navigator.swallowPill(label['swallow pill']);
  }

  // utterances:
  intents(label.intents, context);

  return Promise.resolve();

  } catch (err) {
    return Promise.reject(err);
  }

}

