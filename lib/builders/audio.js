'use strict';

const md5        = require('md5');
const evalString = require('../eval-string');
const coffeeEval = require('../coffee-eval');

module.exports = (audio, context) => {
  if(!audio) {return;}
  
  context.setUnlessExists('responseBody.directives', []);

  let url;

  if(audio === 'stop'){
    context.responseBody.directives.push({
      "type": "AudioPlayer.Stop"
    });
    return;
  }
  if(audio === 'clear enqueued'){
    context.responseBody.directives.push({
      "type": "AudioPlayer.ClearQueue",
      "clearBehavior" : "CLEAR_ENQUEUED"
    });
    return;
  }
  if(audio === 'clear all' || audio === 'clear'){
    context.responseBody.directives.push({
      "type": "AudioPlayer.ClearQueue",
      "clearBehavior" : "CLEAR_ALL"
    });
    return;
  }
  if(typeof audio === 'string'){
    url = evalString(audio, context);
    context.responseBody.directives.push({
      "type": "AudioPlayer.Play",
      "playBehavior": "REPLACE_ALL",
      "audioItem": {
        "stream": {
          "token": md5(url),
          "url": url,
          "offsetInMilliseconds": 0
        }
      }
    });
  } else if (Array.isArray(audio)) {
    // if we happen to get an array
    // the best attempt is to try the
    // first item because why not
    if(!audio.length){return;}
    url = evalString(audio[0], context);
    context.responseBody.directives.push({
      "type": "AudioPlayer.Play",
      "playBehavior": "REPLACE_ALL",
      "audioItem": {
        "stream": {
          "token": md5(url),
          "url": url,
          "offsetInMilliseconds": 0
        }
      }
    });
  } else if (typeof audio === 'object') {
    if(!audio.url){ return; }
    url = evalString(audio.url, context);
    context.responseBody.directives.push({
      "type": "AudioPlayer.Play",
      "playBehavior": audio.behavior || "REPLACE_ALL",
      "audioItem": {
        "stream": {
          "token": audio.token ? JSON.stringify(audio.token) : md5(url),
          "url": url,
          "offsetInMilliseconds": audio.offset || 0
        }
      }
    });
  }
}

