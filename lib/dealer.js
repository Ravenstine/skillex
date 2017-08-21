'use strict';

const generateContext = require('./context-generator');
const swallowPill     = require('./pill-swallower');
const intents         = require('./builders/intents');
const _events         = require('./builders/events');

// Basically the 'run loop' of the skill.

module.exports = (request, pills) => {
  return new Promise((resolve, reject) => {
    
    let context = generateContext(request, pills);

    let currentLabel  = context.navigator.currentLabel;
    
    // If we've been waiting for a user response, and we
    // have received one, continue the deferred conditionals
    // in the label.
    if(context.navigator.hasFinishedWaiting){
      _events(currentLabel.events, context);
      intents(currentLabel.intents, context);
      if(!context.navigator.hasNavigated){
        // If no navigation occurred after waiting, 
        // there's nowhere else to go, so exit the app.
        return resolve(context);
      }
    }

    context.navigator.stopWaiting();
    context.navigator.reload();

    function takeAPill(){
      swallowPill(context.navigator.currentPill, context)
        .then(() => {
          if(context.navigator.hasNavigated && !context.navigator.isWaiting){
            context.navigator.reload();
            takeAPill();
          } else {
            resolve(context);
          }
        })
        .catch((err) => {
          reject(err);
        });
    }

    takeAPill();

  });
}

