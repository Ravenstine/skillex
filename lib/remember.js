'use strict';

let adapter;

if(process.env.DYNAMODB_TABLE_NAME){
  adapter = require('./adapters/dynamodb');
} else if(process.env.COUCHDB_DATABASE_NAME){
  adapter = require('./adapters/couchdb');
} else {
  adapter = require('./adapters/null');
}

module.exports = (request) => {
  if(Object.keys(request.session.attributes || {}).length) return Promise.resolve(request); 
  // If we already have session attributes,
  // we don't want to spend time making an http
  // request for data we won't use, so do nothing.
  return adapter.get(request.session.user.userId)
    .then(doc => {
      // If the request comes with a state,
      // make the saved state available.
      request.SAVED_SESSION = doc;
      return request;
    });
}

