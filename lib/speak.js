'use strict';

const evalString  = require('./eval-string');
const correctSSML = require('ssml-validator').correct;

module.exports = (inputText, context) => {
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = evalString(inputText['en-US'], context) || '';
  } else {
    output = evalString(inputText, context) || '';
  }
  context.payload.outputSpeech = context.payload.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  output = correctSSML(output);
  context.payload.outputSpeech.ssml  = context.payload.outputSpeech.ssml.replace(/<\/speak>/, '');
  context.payload.outputSpeech.ssml += (`${output} </speak>` || '');
}

