'use strict';

const speak    = require('./speak');

module.exports = (onError, context, error) => {
  if(!onError) return Promise.reject(error);
  speak(onError.say, context); // say:
  context.navigator.navigate(onError);
}

