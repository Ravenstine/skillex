'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml')
const glob     = require('glob-fs')({ gitignore: true });

const pillsLoader  = require('./pills-loader');
const swallowPill  = require('./pill-swallower');
const makeChoice   = require('./chooser');

module.exports = (pillsDirectory) => {

  const pills = pillsLoader(pillsDirectory); // preload our pills

  return (event, context, callback) => {
    // we default to the entrypoint pill if no pill is specified in the request
    let data = {
      version: "1.0",
      sessionAttributes: {
        PILL: (event.session.attributes || {})['PILL'] || 'entrypoint',
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
    makeChoice(choice, event, data);

    function swallowPills(){

      currentPill = pills[data.sessionAttributes.PILL];

      swallowPill(currentPill, event, data);

      if(data.sessionAttributes.LABEL && data.response.shouldEndSession){
        swallowPills();
      }
    }

    swallowPills();

    callback(null, data);
  };
}

