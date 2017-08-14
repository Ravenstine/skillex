'use strict';

let peelLabel    = require('./label-peeler');
let speak        = require('./speak');
let intend       = require('./intend');
const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');

module.exports = (choice, context) => {

  if(!choice) { return; }

  // intents: / options:
  intend(choice.options || choice.intents, context);

}

