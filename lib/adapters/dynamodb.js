'use strict';

const aws = require('aws-sdk');

let newTableParams = {
  AttributeDefinitions: [
    {
      AttributeName: 'userId',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'userId',
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

module.exports = {
  get(table, userId) {
    return new Promise((resolve, reject) => {

      if(!table) {
        return reject('DynamoDB Table name is not set.');
      }

      let doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

      let params = {
        Key: {
          userId: userId
        },
        TableName: table,
        ConsistentRead: true
      };

      doc.get(params, (err, data) => {
        if(err) {
          reject(err)
        } else {
          if(data.Item) {
            resolve(data.Item.mapAttr);
          } else {
            resolve({});
          }
        }
      });

    });
  },

  set(table, userId, data) {
    return new Promise((resolve, reject) => {
      if(!table) {
        return reject('DynamoDB Table name is not set.');
      }

      let doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

      let params = {
        Item: {
          userId: userId,
          mapAttr: data
        },
        TableName: table
      };

      doc.put(params, (err, data) => {
        if(err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
};

