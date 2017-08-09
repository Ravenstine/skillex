'use strict';

const evalString = require('./eval-string');

module.exports = (inputText, context) => {
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = inputText['en-US'] || '';
  } else {
    output = evalString(inputText, context) || '';
  }
  context.payload.outputSpeech = context.payload.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  context.payload.outputSpeech.ssml  = context.payload.outputSpeech.ssml.replace(/<\/speak>/, '');
  context.payload.outputSpeech.ssml += (`${output} </speak>` || '');
}

