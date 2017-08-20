'use strict';

const aws = require('aws-sdk');

module.exports = {
  get(userId) {
    return new Promise((resolve, reject) => {

      if(!process.env.DYNAMODB_TABLE_NAME) {
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

  put(userId, data) {
    return new Promise((resolve, reject) => {
      if(!process.env.DYNAMODB_TABLE_NAME) {
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

