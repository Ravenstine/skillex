'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml')
const glob     = require('glob-fs')({ gitignore: true });

const pillBox      = require('./pill-box');
const swallowPill  = require('./pill-swallower');
const webRequest   = require('./web-request');
const choose       = require('./choose');
const SlotValue    = require('./slot-value');


module.exports = (pillsDirectory) => {

  const pills  = pillBox(pillsDirectory); // preload our pills
  // originally, we didn't need to build a schema in the application
  // itself, but it's useful if we need extra settings in regards to

  return (request, ctx, callback) => {
    // we default to the entrypoint pill if no pill is specified in the request
    let response = {
      version: "1.0",
      sessionAttributes: Object.assign({
        PILL: 'entrypoint',
        ATTRIBUTES: {}
      }, ((request.session || {}).attributes || {})),
      response: {
        shouldEndSession: true
      }
    }

    let context = {
      request: request,
      response: response,
      payload: response.response,
      attributes: response.sessionAttributes.ATTRIBUTES,
      sessionAttributes: response.sessionAttributes,
      slots: {},
      temp: {}
    }

    // If there are slots in the request, let's make a
    // nice little slots object to add to our context.
    if(request && request.request && request.request.type == "IntentRequest"){
      let intentSlots = (((request.request || {}).intent || {}).slots || {});
      Object.keys(intentSlots).forEach((slotName) => {
        context.slots[slotName] = new SlotValue(intentSlots[slotName]);
      });
    }

    let currentPill = pills[context.sessionAttributes.PILL];

    let choice      = (currentPill[context.sessionAttributes.LABEL] || {}).choice;

    // if we have a label on load,
    // we assume a choice is being made
    choose(choice, context);


    function takeAPill(){
      let currentPillName = context.sessionAttributes.PILL;

      currentPill         = pills[context.sessionAttributes.PILL];

      swallowPill(currentPill, context).then(() => {
        let pillHasChanged =  context.sessionAttributes.PILL   && currentPillName != context.sessionAttributes.PILL;

        if((pillHasChanged || context.sessionAttributes.LABEL) && context.payload.shouldEndSession){
          takeAPill();
        } else {
          callback(null, response);
        }
      });

    }

    takeAPill();

  };
}

