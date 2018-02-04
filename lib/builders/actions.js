'use strict';

const speak    = require('./speak');

module.exports = (actions, context) => {

  if(!actions) return;

  let action;

  if(context.get('requestBody.type') == 'IntentRequest'){
    let intentName  = context.getWithDefault('requestBody.intent', {})['name'];
    action          = actions[intentName];
  } else {
    let requestName = context.get('requestBody.type');
    action          = actions[requestName];
  }

  if(!action) action = actions['?'] || {}; // choose wildcard action if no action

  speak(action.say, context); // say:

  context.navigator.navigate(action);
  
}

