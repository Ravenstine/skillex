'use strict';

module.exports = (onError, context, error) => {
  if(!onError) return Promise.reject(error);
  speak(action.say, context); // say:
  context.navigator.navigate(onError);
}

