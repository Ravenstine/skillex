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
  return Promise.resolve()
  .then(() => restore(label.restore, context)) // restore:
  .then(() => coffeeEval(label.script, context)) // script:
  .then(() => console.log(context))
  // .then(() => {
  //   console.log(context.get('response'));
  //   speak(label.speak, context)
  //   console.log(context.get('response'));
  // })
  .then(() => speak(label.speak, context)) // say:
  .then(() => audio(label.audio, context)) // audio:
  .then(() => card(label.card, context)) // card:
  .then(() => {
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
      // return Promise.resolve();
      context.navigator.lock();
    }
  })
  .then(() => {
    // go to:
    if(label.hasOwnProperty('go to')) {
      context.navigator.goTo(label['go to']);
    }
    // swallow pill:
    if(label.hasOwnProperty('swallow pill')){
      context.navigator.swallowPill(label['swallow pill']);
    }
  })
  .then(() => intents(label.intents, context)) // utterances:
  .then(() => context.navigator.unlock())
}

