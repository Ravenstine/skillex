'use strict';

const peelLabel = require('./label-peeler');

function pillSwallower(pill, request, response){

  response.sessionAttributes.LABEL = response.sessionAttributes.LABEL || Object.keys(pill)[0];

  // Assume we are not going to navigate to another pill.
  // The only way this gets overridden is if a label in
  // the pill has a key named `swallow pill:`.
  //
  // The reason we set this attribute to null is so the
  // skill can exit state by default when the session is
  // over.
  // response.sessionAttributes.PILL  = null;
  console.log("########################################")
  console.log(pill[response.sessionAttributes.LABEL])
  console.log("########################################")
  peelLabel(pill[response.sessionAttributes.LABEL], request, response);

}

module.exports = pillSwallower;
