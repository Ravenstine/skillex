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
  return new Promise((resolve, reject) => {
    adapter.get(request.session.user.userId)
      .then((doc) => {
        delete doc._id;
        delete doc._rev;
        Object.assign(request.session, doc);
        return resolve();
      }).catch(reject);
  });
}

