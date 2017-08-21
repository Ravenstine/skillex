'use strict';

let adapter;

if(process.env.DYNAMODB_TABLE_NAME){
  adapter = require('./adapters/dynamodb');
} else if(process.env.COUCHDB_DATABASE_NAME){
  adapter = require('./adapters/couchdb');
} else {
  adapter = require('./adapters/null');
}

module.exports = (context) => {
  return adapter.put(context.session.user.userId, {
    PILL: context.sessionAttributes.PILL,
    LABEL: context.sessionAttributes.LABEL,
    ATTRIBUTES: context.sessionAttributes.ATTRIBUTES
  });
}

