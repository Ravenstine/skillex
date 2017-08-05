'use strict';

const http        = require('follow-redirects').http;
const parseURI    = require('parse-uri');
const coffeeEval  = require('./coffee-eval');
const WebResponse = require('./web-response');
const speak       = require('./speak');

// This is how HTTP(s) requests are made, and it will always be the first thing
// to be executed per-label.  It's currently the only way to perform an aync
// operation in the app, as no request module is exposed to the `script:` VM.

module.exports = (webRequest, context) => {

  if(!webRequest){ return Promise.resolve(); }

  let defaultOptions = {
    hostname: '',
    protocol: 'http:',
    path: ``,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/1.0.154.53 Safari/525.19'
    },
    method: 'GET'
  }

  let uri;

  if(typeof webRequest === 'string') {
    uri = parseURI(webRequest);
  } else if (typeof webRequest === 'object') {
    uri = parseURI(webRequest.url);
    defaultOptions.method  = webRequest.hasOwnProperty('method')  ? webRequest.method  : 'GET';
    defaultOptions.headers = webRequest.hasOwnProperty('headers') ? webRequest.headers : 'GET';
  }

  defaultOptions.hostname = uri.host;
  defaultOptions.protocol = `${uri.protocol}:`;
  defaultOptions.path     = uri.relative;

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
          if(webRequest.script){
            context.webResponse = coffeeEval(webRequest.script, context);
          }
          resolve(context.webResponse);
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

