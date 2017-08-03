'use strict';

module.exports = (response, inputText) => {
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = inputText['en-US'] || '';
  } else {
    output = inputText || '';
  }
  response.response.outputSpeech = response.response.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  response.response.outputSpeech.ssml  = response.response.outputSpeech.ssml.replace(/<\/speak>/, '');
  response.response.outputSpeech.ssml += (`${output} </speak>` || '');
}

