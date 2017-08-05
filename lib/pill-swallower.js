'use strict';

const peelLabel = require('./label-peeler');
const speak     = require('./speak');

function pillSwallower(pill, context){

  context.attributes.LABEL = context.attributes.LABEL || Object.keys(pill)[0];

  // Assume we are not going to navigate to another pill.
  // The only way this gets overridden is if a label in
  // the pill has a key named `swallow pill:`.
  //
  // The reason we set this attribute to null is so the
  // skill can exit state by default when the session is
  // over.
  // context.attributes.PILL  = null;
  return peelLabel(pill[context.attributes.LABEL], context);

}

module.exports = pillSwallower;
