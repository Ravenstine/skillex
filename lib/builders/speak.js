'use strict';

const evalString  = require('../eval-string');
const correctSSML = require('ssml-validator').correct;

module.exports = (input, context) => {
  if(!input){ return; }
  let output, selection;
  if(input instanceof Object && !(input instanceof Array)) {
    selection = input[context.requestBody.locale] || input['en-US'];
  } else {
    selection = input;
  }
  if(Array.isArray(selection)){
    selection = selection[Math.floor(Math.random()*selection.length)];
  }
  output = evalString(selection, context) || '';
  context.responseBody.outputSpeech = context.responseBody.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  output = correctSSML(output);
  context.responseBody.outputSpeech.ssml  = context.responseBody.outputSpeech.ssml.replace(/<\/speak>/, '');
  context.responseBody.outputSpeech.ssml += (`${output} </speak>` || '');
}

