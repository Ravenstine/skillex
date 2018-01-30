'use strict';

const recall          = require('./recall');
const persist         = require('./persist');
const runtime         = require('./runtime');
const speak           = require('./builders/speak');
const generateContext = require('./context-generator');

module.exports = (scenes) => {

  return (request, ctx, callback) => {
    // we default to the entrypoint state if no scene is specified in the request
    recall(request)
    .then(request => generateContext(request, {}, scenes))
    .then(context => {
      return runtime(context, scenes) // evaluate the request
        .then(() => persist(context))
        .then(() => callback(null, context.response))
        .catch(err => {
          // pass on the context object to the real error handler
          err._context = context;
          return Promise.reject(err);
        });
    })
    .catch(err => {
      // something went very wrong
      console.error(err ? err.stack : err);
      var context = err._context || generateContext();
      let dialog = err.speak || "There was a problem.";
      speak(dialog, context);
      context.navigator.goTo(null); // abort!
      context.navigator.reload(); // act like nothin's happened
      callback(null, context.response);
    });

  };
}

