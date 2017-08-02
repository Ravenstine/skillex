'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml')
const glob     = require('glob-fs')({ gitignore: true });

const pillsLoader = require('./pills-loader');
const pillRunner  = require('./pill-runner');

module.exports = (pillsDirectory) => {

  const pills = pillsLoader(pillsDirectory); // preload our pills

  return (event, context, callback) => {

    let data = {
      "version": "string",
      "sessionAttributes": {
      },
      "response": {
        outputSpeech: {
          type: "text", 
          text: ""
        }
      }
    }

    let currentPillName = 'entrypoint';

    let currentPill     = pills[currentPillName];

    pillRunner(currentPill, context, data);

    callback(null, data);
  };
}

