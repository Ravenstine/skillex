'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml')
const glob     = require('glob-fs')({ gitignore: true });

const pillBox      = require('./pill-box');
const swallowPill  = require('./pill-swallower');
const webRequest   = require('./web-request');
const choose       = require('./choose');

module.exports = (pillsDirectory) => {

  const pills = pillBox(pillsDirectory); // preload our pills

  return (request, ctx, callback) => {
    // we default to the entrypoint pill if no pill is specified in the request
    let response = {
      version: "1.0",
      sessionAttributes: {
        PILL:  ((request.session || {}).attributes || {})['PILL'] || 'entrypoint',
        LABEL: ((request.session || {}).attributes || {})['LABEL']
      },
      response: {
        shouldEndSession: true
      }
    }

    let context = {
      request: request,
      response: response,
      payload: response.response,
      attributes: response.sessionAttributes,
      slots: {},
      temp: {}
    }

    // If there are slots in the request, let's make a
    // nice little slots object to add to our context.
    if(request && request.request && request.request.type == "IntentRequest"){
      let intentSlots = (((request.request || {}).intent || {}).slots || {});
      Object.keys(intentSlots).forEach((slotName) => {
        let slot                 = intentSlots[slotName];
        context.slots[slot.name] = slot.value;
      });
    }

    let currentPill = pills[context.attributes.PILL];

    let choice      = (currentPill[context.attributes.LABEL] || {}).choice;

    // if we have a label on load,
    // we assume a choice is being made
    choose(choice, context);

    function takeAPill(){
      let currentPillName = context.attributes.PILL;

      currentPill         = pills[context.attributes.PILL];

      swallowPill(currentPill, context).then(() => {
        let pillHasChanged =  context.attributes.PILL   && currentPillName != context.attributes.PILL;

        if((pillHasChanged || context.attributes.LABEL) && context.payload.shouldEndSession){
          takeAPill();
        } else {
          callback(null, response);
        }
      });

    }

    takeAPill();

  };
}

