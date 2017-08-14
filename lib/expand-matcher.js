'use strict';

const utteranceExpander = require('intent-utterance-expander');
const camelize          = require('camelize');
const typeAliases       = require('../built-in-slot-type-aliases');


module.exports = (name, intent) => {

  let expander;

  intent.types = intent.types || {};
  intent.slots = intent.slots || {};

  // parse and replace each of our custom slot tokens

  expander = name.replace(/\$\{([A-z]+)\:([A-z|\.]+)\}/g, (token) => {
    let parsedMatcher = token.match(/\$\{([A-z]+)\:([A-z|\.]+)\}/), slotName, slotType;
    slotName = parsedMatcher[1];
    slotType = parsedMatcher[2];
    intent.slots[slotName]        = intent.slots[slotName]        || {};
    intent.slots[slotName].type   = intent.slots[slotName].type   || slotType;
    intent.slots[slotName].values = intent.slots[slotName].values || [];
    return `{${slotName}}`;
  });

  // we parse out and replace slot tokens that are typeless.
  // if they happen to match the name of an AMAZON built-in slot type,
  // we then assume it's of that type.  otherwise, we create a blank type.
  expander = expander.replace(/\$\{\s*([A-z]+)\s*\}/g, (token) => {
    let slotName    = token.match(/\$\{\s*([A-z]+)\s*\}/)[1];
    let guessedType = typeAliases[slotName] || (intent.slots[slotName]||{}).type;
    if(guessedType){
      intent.slots[slotName]        = intent.slots[slotName]        || {};
      intent.slots[slotName].type   = intent.slots[slotName].type   || guessedType;
      intent.slots[slotName].values = intent.slots[slotName].values || [];
      return `{${slotName}}`;
    } else {
      return '';
    }
  });

  intent.samples = (intent.samples || []).concat(utteranceExpander(expander));
}

