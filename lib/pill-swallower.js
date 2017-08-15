'use strict';

const peelLabel = require('./label-peeler');
const speak     = require('./speak');

function pillSwallower(pill, context){

  context.sessionAttributes.LABEL = context.sessionAttributes.LABEL || Object.keys(pill)[0];
  context.sessionAttributes.reset(); // aw man we need to act like the above didn't happen
  // Assume we are not going to navigate to another pill.
  // The only way this gets overridden is if a label in
  // the pill has a key named `swallow pill:`.
  //
  // The reason we set this attribute to null is so the
  // skill can exit state by default when the session is
  // over.
  return peelLabel(pill[context.sessionAttributes.LABEL], context);

}

module.exports = pillSwallower;
