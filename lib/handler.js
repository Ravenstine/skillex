'use strict';

const remember        = require('./remember');
const persist         = require('./persist');
const dealer          = require('./dealer');
const speak           = require('./builders/speak');
const generateContext = require('./context-generator');

module.exports = (pills) => {

  return (request, ctx, callback) => {
    // we default to the entrypoint pill if no pill is specified in the request
    remember(request)
    .then(request => generateContext(request, pills))
    .then(context => {
      return dealer(context, pills) // evaluate the request
        .then(() => persist(context))
        .then(() => callback(null, context.response))
        .catch(err => {
          err._context = context;
          return Promise.reject(err);
        });
    })
    .catch(err => {
      // something went very wrong
      console.error(err ? err.stack : err);
      let dialog = err.speak || "There was a problem.";
      // let dialog = err.speak || label['error dialog'] || "Looks like I overdosed!";
      speak(dialog, err._context);
      context.navigator.goTo(null); // abort!
      context.navigator.reload(); // act like nothin's happened
      callback(err);
    });

  };
}

