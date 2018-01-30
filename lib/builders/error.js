'use strict';

module.exports = (onError, context, error) => {
  if(!onError) return Promise.reject(error);
  context.navigator.navigate(onError);
}

