'use strict';

const coffeeEval = require('./coffee-eval');
const speak      = require('./builders/speak');
const reprompt   = require('./builders/reprompt');
const audio      = require('./builders/audio');
const actions    = require('./builders/actions');
const card       = require('./builders/card');
const restore    = require('./builders/restore');
const condition  = require('./builders/condition');
const error      = require('./builders/error');

module.exports = (label, context) => {
  if(!label) return Promise.resolve();
  return Promise.resolve()
  .then(() => restore(label.restore, context)) // restore:
  .then(() => coffeeEval(label.script, context)) // script:
  .then(scriptResult => {
    if(!(context.get('navigator.repeatFrom') == 'question')){
      speak(label.say, context); // say:
      card(label.card, context); // card:
    }
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
    } else {
      // audio:
      audio(label.audio, context);
      // toplevel navigation (go to|go to scene|go to random)
      context.navigator.navigate(label);
      // if (true|false):
      condition(label, context, scriptResult);
      // actions:
      actions(label.actions, context);
    }
    context.navigator.unlock();
    context.navigator.continue(); // clear an existing repeat
  })
  .catch(err => error(label.error, context, err)); // error:
}

