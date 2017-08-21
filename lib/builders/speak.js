'use strict';

const evalString  = require('../eval-string');
const correctSSML = require('ssml-validator').correct;

module.exports = (inputText, context) => {
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = evalString(inputText['en-US'], context) || '';
  } else {
    output = evalString(inputText, context) || '';
  }
  context.responseBody.outputSpeech = context.responseBody.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  output = correctSSML(output);
  context.responseBody.outputSpeech.ssml  = context.responseBody.outputSpeech.ssml.replace(/<\/speak>/, '');
  context.responseBody.outputSpeech.ssml += (`${output} </speak>` || '');
}

