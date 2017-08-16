'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml')
const glob     = require('glob-fs')({ gitignore: true });

const pillBox      = require('./pill-box');
const swallowPill  = require('./pill-swallower');
const webRequest   = require('./web-request');
const choose       = require('./choose');
const SlotValue    = require('./slot-value');
const Attributes   = require('./attributes');


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
      requestBody: request.request,
      response: response,
      responseBody: response.response,
      attributes: response.sessionAttributes.ATTRIBUTES,
      sessionAttributes: Attributes(response.sessionAttributes),
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

    let currentPill      = pills[context.sessionAttributes.PILL];
    let currentLabelName = context.sessionAttributes.LABEL;
    let currentLabel     = currentPill[currentLabelName] || {};
    let choice           = currentLabel.choice;

    // if we have a label on load,
    // we assume a choice is being made
    choose(choice, context);

    // kind of a hack at the moment to allow the
    // label's `go to:` to continue to work in case
    // a choice did not specify a `go to:`.
    // not sure where eactly this should end up.
    if(choice){
      if(currentLabel.hasOwnProperty('go to pill')   && !context.sessionAttributes.hasChanged('PILL')){
        context.sessionAttributes.PILL  = currentLabel['go to pill'];
        context.sessionAttributes.LABEL = null;
      } else if(currentLabel.hasOwnProperty('go to') && !context.sessionAttributes.hasChanged('LABEL')){
        context.sessionAttributes.LABEL = currentLabel['go to'];
      } else if(!(context.sessionAttributes.hasChanged('PILL') || context.sessionAttributes.hasChanged('LABEL'))){
        return callback(null, response);
      }
    }

    context.sessionAttributes.reset();

    function takeAPill(){
      currentPill         = pills[context.sessionAttributes.PILL];
      swallowPill(currentPill, context).then(() => {
        let hasNavigated    = context.sessionAttributes.hasChanged('PILL') || context.sessionAttributes.hasChanged('LABEL');
        if(hasNavigated && context.responseBody.shouldEndSession){
          context.sessionAttributes.reset();
          takeAPill();
        } else {
          callback(null, response);
        }
      });

    }

    takeAPill();

  };
}

