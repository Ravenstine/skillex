'use strict';

const coffeeEval = require('./coffee-eval');
const speak      = require('./builders/speak');
const reprompt   = require('./builders/reprompt');
const audio      = require('./builders/audio');
const intents    = require('./builders/intents');
const card       = require('./builders/card');
const restore    = require('./builders/restore');
const condition  = require('./builders/condition');
const error      = require('./builders/error');

module.exports = (label, context) => {
  if(!label){ return Promise.resolve(); }
  return Promise.resolve()
  .then(() => restore(label.restore, context)) // restore:
  .then(() => coffeeEval(label.script, context)) // script:
  .then(scriptResult => {
    speak(label.say, context) // say:
    audio(label.audio, context) // audio:
    card(label.card, context)   // card:
    // ask:
    // if the label has a choice defined and we haven't
    // already used go to outside of the choice
    if(label.hasOwnProperty('ask')){
      speak(label.ask, context);
      let repromptValue = label.reprompt || label.ask;
      reprompt(repromptValue, context);
      // 👆 the default reprompt is the choice dialog, unless
      // `reprompt: ` is specified or cleared when `reprompt: false`
      context.navigator.wait();
      // if we are asking a question, we don't want to
      // continue on to react to the utterances set in
      // the label.  that should only happen in the next
      // request when the question is answered.
      context.navigator.lock();
    }
    // go to (scene):
    context.navigator.navigate(label);
    // if (true|false):
    condition(label, context, scriptResult);
    // intents:
    intents(label.intents, context)
    context.navigator.unlock()
  })
  .catch(err => error(label.error, context, err)); // error:
}

