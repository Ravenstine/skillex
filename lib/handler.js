'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml')
const glob     = require('glob-fs')({ gitignore: true });

const pillBox      = require('./pill-box');
const swallowPill  = require('./pill-swallower');
const choose       = require('./choose');

module.exports = (pillsDirectory) => {

  const pills = pillBox(pillsDirectory); // preload our pills

  return (event, context, callback) => {
    // we default to the entrypoint pill if no pill is specified in the request
    let data = {
      version: "1.0",
      sessionAttributes: {
        PILL:  (event.session.attributes || {})['PILL'] || 'entrypoint',
        LABEL: (event.session.attributes || {})['LABEL']
      },
      response: {
        shouldEndSession: true
      }
    }

    let currentPill = pills[data.sessionAttributes.PILL];

    let choice      = (currentPill[data.sessionAttributes.LABEL] || {}).choice;

    // if we have a label on load,
    // we assume a choice is being made
    choose(choice, event, data);

    function takeAPill(){
      let currentPillName = data.sessionAttributes.PILL;

      currentPill         = pills[data.sessionAttributes.PILL];

      swallowPill(currentPill, event, data);

      let pillHasChanged  = data.sessionAttributes.PILL && currentPillName != data.sessionAttributes.PILL;

      if((pillHasChanged || data.sessionAttributes.LABEL) && data.response.shouldEndSession){
        takeAPill();
      }
    }

    takeAPill();

    callback(null, data);
  };
}

