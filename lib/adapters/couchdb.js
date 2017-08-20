'use strict';

const https = require('follow-redirects').https;

let defaultOptions = {
  hostname: '',
  protocol: 'https:',
  path: ``,
  headers: {},
  method: 'GET'
}

function request(options, payload){
  let requestOptions = Object.assign({}, defaultOptions);
  Object.assign(requestOptions, options);

  let requestBody; 
  if(payload){
    requestBody                      = JSON.stringify(payload);
    requestOptions['Content-Length'] = Buffer.byteLength(requestBody);
  }
  if(process.env.COUCHDB_COOKIE){
    requestOptions.headers['Set-Cookie']              = process.env.COUCHDB_COOKIE;
  }
  if(process.env.COUCHDB_TOKEN){
    requestOptions.headers['X-Auth-CouchDB-Token']    = process.env.COUCHDB_TOKEN;
  }
  if(process.env.COUCHDB_USERNAME){
    requestOptions.headers['X-Auth-CouchDB-UserName'] = process.env.COUCHDB_USERNAME;
  }
  if(process.env.COUCHDB_ROLES){
    requestOptions.headers['X-Auth-CouchDB-Roles']    = process.env.COUCHDB_ROLES;
  }
  return new Promise((resolve, reject) => {
    let req = https.request(requestOptions, (res) => {
      if(!`${res.statusCode}`.match(/20.*/)){
        console.warn(`Response Status ${res.statusCode}`);
        return resolve({});
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(err) {
          // If the response body was malformed,
          // let's just return a blank document.
          console.error(err);
          resolve({});
        }
      });
      res.on('error', reject);
    });
    if(requestBody){
      req.write(requestBody);
    }
    req.end();
    req.on('error', reject);
  });
}

module.exports = {
  get(userId) {
    if(!process.env.COUCHDB_HOST) {
      return reject('CouchDB host name is not set.');
    }
    return request({
      hostname: process.env.COUCHDB_HOST,
      path: `/${process.env.COUCHDB_DATABASE_NAME}/${userId}`
    });
  },

  put(userId, data) {
    return this.get(userId).then((doc) => {
      data._id = doc._id || userId;
      if(doc._rev){
        data._rev = doc._rev;
      }
      if(!process.env.COUCHDB_HOST) {
        return reject('CouchDB host name is not set.');
      }
      return request({
        hostname: process.env.COUCHDB_HOST,
        path: `/${process.env.COUCHDB_DATABASE_NAME}/${userId}`,
        method: 'PUT'
      }, data);
    });
  }
};

