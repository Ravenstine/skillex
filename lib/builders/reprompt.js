'use strict';

const evalString  = require('../eval-string');
const correctSSML = require('ssml-validator').correct;

module.exports = (inputText, context) => {
  if(inputText === false){
    // By default, we reprompt with the existing choice dialog if
    // no alternative reprompt dialog is provided.  Sometimes you
    // may not want a reprompt at all, in which case specifying
    // `reprompt: false` will clear reprompt data from the response.
    delete context.responseBody.reprompt;
    return;
  }
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = evalString(inputText['en-US'], context) || '';
  } else {
    output = evalString(inputText, context) || '';
  }
  output = correctSSML(output);
  context.responseBody.reprompt              = context.responseBody.reprompt || {};
  context.responseBody.reprompt.outputSpeech = context.responseBody.reprompt.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  context.responseBody.reprompt.outputSpeech.ssml  = context.responseBody.reprompt.outputSpeech.ssml.replace(/<\/speak>/, '');
  context.responseBody.reprompt.outputSpeech.ssml += (`${output} </speak>` || '');
}

