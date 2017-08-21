'use strict';

const http        = require('follow-redirects').https;
const parseURI    = require('parse-uri');
const coffeeEval  = require('../coffee-eval');
const evalString  = require('../eval-string');
const speak       = require('./speak');

// This is how HTTP(s) requests are made, and it will always be the first thing
// to be executed per-label.  It's currently the only way to perform an aync
// operation in the app, as no request module is exposed to the `script:` VM.

function pluck(object, key){
  if(!Array.isArray(object) && typeof object !== 'object'){
    return;
  }
  let filtration = [];
  if(Array.isArray(object)){
    filtration = object.map(k => pluck(object[k], key)).filter(o => o);
  }
  if(object[key]){
    return object[key];
  } else {
    filtration = Object.keys(object).map(k => pluck(object[k], key)).filter(o => o);
  }
  if(filtration.length){
    return filtration[0];
  }
}

module.exports = (webRequest, context) => {

  if(!webRequest){ return Promise.resolve(); }

  let defaultOptions = {
    hostname: '',
    protocol: 'https:',
    path: ``,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/1.0.154.53 Safari/525.19'
    },
    method: 'GET'
  }

  let uri;

  if(typeof webRequest === 'string') {
    uri = parseURI(evalString(webRequest, context));
  } else if (typeof webRequest === 'object') {
    uri = parseURI(evalString(webRequest.url, context));
    defaultOptions.method  = webRequest.hasOwnProperty('method')  ? webRequest.method  : 'GET';
    defaultOptions.headers = webRequest.hasOwnProperty('headers') ? webRequest.headers : defaultOptions.headers;
  }
  let query               = Object.keys(uri.queryKey).map(k => `${k}=${encodeURIComponent(decodeURIComponent(uri.queryKey[k]))}`).join('&');
  defaultOptions.hostname = evalString(uri.host, context);
  defaultOptions.protocol = `${uri.protocol}:`;
  defaultOptions.path     = evalString([uri.path, query].join('?'), context);

  return new Promise((resolve, reject) => {
    let req = http.request(defaultOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          // no, we don't give a shit about data that's not json
          context.webResponse = JSON.parse(data);
          if(webRequest.pluck){
            context.webResponse = pluck(context.webResponse, webRequest.pluck);
          }
          if(webRequest.script){
            context.webResponse = coffeeEval(webRequest.script, context, context.webResponse);
          }
          if(webRequest["none speech"] && context.webResponse === void(0)){
            reject({error: "empty web response", dialog: webRequest['none dialog']});
          } else {
            resolve();
          }
        } catch(err) {
          reject(err);
        }
      });
      res.on('error', reject);
    });
    req.end();
    req.on('error', reject);
  });

}

