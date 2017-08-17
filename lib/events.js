'use strict';

const respond  = require('./respond');

// Events are synonmyous with request types,
// at least for now.

module.exports = (_events, context) => {

  if(!_events) { return; }

  // let eventName = (context.request.type || '').replace(/Request\s*$/, '');

  let eventName = context.requestBody.type;

  let event     = _events[eventName];

  respond(event, context);
}

