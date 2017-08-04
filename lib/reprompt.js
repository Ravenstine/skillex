'use strict';

module.exports = (response, inputText) => {
  if(inputText === false){
    // By default, we reprompt with the existing choice dialog if
    // no alternative reprompt dialog is provided.  Sometimes you
    // may not want a reprompt at all, in which case specifying
    // `reprompt: false` will clear reprompt data from the response.
    delete response.response.reprompt;
    return;
  }
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = inputText['en-US'] || '';
  } else {
    output = inputText || '';
  }
  response.response.reprompt              = response.response.reprompt || {};
  response.response.reprompt.outputSpeech = response.response.reprompt.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  response.response.reprompt.outputSpeech.ssml  = response.response.reprompt.outputSpeech.ssml.replace(/<\/speak>/, '');
  response.response.reprompt.outputSpeech.ssml += (`${output} </speak>` || '');
}

