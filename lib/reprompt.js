'use strict';

module.exports = (inputText, context) => {
  if(inputText === false){
    // By default, we reprompt with the existing choice dialog if
    // no alternative reprompt dialog is provided.  Sometimes you
    // may not want a reprompt at all, in which case specifying
    // `reprompt: false` will clear reprompt data from the response.
    delete context.payload.reprompt;
    return;
  }
  if(!inputText){ return; }
  let output;
  if(typeof inputText === 'object') {
    output = inputText['en-US'] || '';
  } else {
    output = inputText || '';
  }
  context.payload.reprompt              = context.payload.reprompt || {};
  context.payload.reprompt.outputSpeech = context.payload.reprompt.outputSpeech || {
    type: "SSML", 
    ssml: "<speak>"
  };
  context.payload.reprompt.outputSpeech.ssml  = context.payload.reprompt.outputSpeech.ssml.replace(/<\/speak>/, '');
  context.payload.reprompt.outputSpeech.ssml += (`${output} </speak>` || '');
}

