'use strict';

let peelLabel    = require('./label-peeler');
let speak        = require('./speak');
let intend       = require('./intend');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (choice, context) => {

  if(!choice) { return; }

  // // script:
  // coffeeEval(decision.script, context);

  // // dialog:
  // speak(evalString(decision.dialog, context), context);

  // intents: / options:
  intend(choice.options || choice.intents, context);

  // go to:
  // if(decision.hasOwnProperty('go to')) {
  //   context.attributes.LABEL = decision['go to'];
  // }

}

