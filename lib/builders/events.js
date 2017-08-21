'use strict';

const respond  = require('../respond');

module.exports = (_events, context) => {

  if(!_events) { return; }

  let eventName = context.requestBody.type;

  let event     = _events[eventName];

  respond(event, context);

  if(context.session.SAVED_SESSION){
    respond('SavedSessionAvailable', context);
  }

}

