'use strict';

const remember     = require('./remember');
const persist      = require('./persist');
const dealer       = require('./dealer');


module.exports = (pills) => {

  return (request, ctx, callback) => {
    // we default to the entrypoint pill if no pill is specified in the request
    remember(request)
    .then(() => dealer(request, pills)) // evaluate the request
    .then(context => {
      // Post processing
      return persist(context)
        .then(() => callback(null, context.response));
    })
    .catch(err => {
      // something went very wrong
      console.error(err ? err.stack : err);
      let dialog = err.speak || label['error dialog'] || "Looks like I overdosed!";
      speak(dialog, context);
      context.navigator.goTo(null); // abort!
      context.navigator.reload(); // act like nothin's happened
      callback(err);
    });

  };
}

