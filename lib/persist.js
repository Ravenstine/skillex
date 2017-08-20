'use strict';

let adapter;

if(process.env.DYNAMODB_TABLE_NAME){
  adapter = require('./adapters/dynamodb');
} else if(process.env.COUCHDB_DATABASE_NAME){
  adapter = require('./adapters/couchdb');
} else {
  adapter = require('./adapters/null');
}

module.exports = (persist, context) => {
  if(!persist){return Promise.resolve();}
  let session = {
    attributes: {}
  };
  if(persist === 'session'){
    Object.assign(session.attributes, context.sessionAttributes);
  } else if (persist === 'attributes') {
    Object.assign(session.attributes.ATTRIBUTES, context.attributes);
  }
  return adapter.put(context.session.user.userId, session);
}

