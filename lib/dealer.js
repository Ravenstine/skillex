'use strict';

const generateContext = require('./context-generator');
const peelLabel       = require('./label-peeler');
const intents         = require('./builders/intents');

// Basically the 'run loop' of the skill.

module.exports = (request, pills) => {
  return new Promise((resolve, reject) => {
    
    let context = generateContext(request, pills);

    let currentLabel  = context.navigator.currentLabel;
    
    // If we've been waiting for a user response, and we
    // have received one, continue the deferred conditionals
    // in the label.
    if(context.navigator.hasFinishedWaiting){
      intents(currentLabel.intents, context);
      if(!context.navigator.hasNavigated){
        if(context.navigator.willNavigate) context.navigator.navigate(currentLabel);
        if(!context.navigator.hasNavigated) return resolve(context);
        // If no navigation occurred after waiting, 
        // and the label itself won't navigate,
        // there's nowhere else to go, so exit the app.
      }
    }

    context.navigator.stopWaiting();
    context.navigator.reload();
    
    function takeAPill(){
      // Assume we are not going to navigate to another pill.
      // The only way this gets overridden is if a label in
      // the pill has a key named `swallow pill:`.
      //
      // The reason we set this attribute to null is so the
      // skill can exit state by default when the session is
      // over.
      peelLabel(context.get('navigator.currentLabel'), context);
        .then(() => {
          if(context.navigator.hasNavigated && !context.navigator.isWaiting){
            context.navigator.reload();
            takeAPill();
          } else {
            resolve(context);
          }
        })
        .catch(err => reject(err));
    }

    takeAPill();

  });
}

