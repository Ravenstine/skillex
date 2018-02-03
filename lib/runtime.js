'use strict';

const peelLabel       = require('./label-peeler');
const intents         = require('./builders/intents');

// Basically the 'run loop' of the skill.

module.exports = (context, scenes) => {
  return new Promise((resolve, reject) => {

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

    if(!context.get('navigator.hasNavigated') && !context.get('navigator.currentLabelName')){
      let firstLabelName = Object.keys(context.get('navigator.currentScene') || {})[0];
      context.navigator.goTo(firstLabelName);
    }

    context.navigator.reload();
    
    function run(){
      // Assume we are not going to navigate to another scene.
      // The only way this gets overridden is if a label in
      // the scene has a key named `go to scene:`.
      //
      // The reason we set this attribute to null is so the
      // skill can exit scene by default when the session is
      // over.
      // console.log(context.navigator.currentLabel);
      peelLabel(context.get('navigator.currentLabel'), context)
        .then(() => {
          if(context.get('navigator.hasNavigated') && !context.get('navigator.isWaiting')){
            context.navigator.reload();
            run();
          } else {
            resolve(context);
          }
        })
        .catch(err => reject(err));
    }

    run();

  });
}

