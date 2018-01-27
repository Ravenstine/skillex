'use strict';

const evalString  = require('../eval-string');
const correctSSML = require('ssml-validator').correct;
const Handlebars  = require('handlebars');

let functions = {
  say: function(value, context){
    // let output = evalString(value, context) || '';
    let output = Handlebars.compile(value || '')(context.coalesce());
    output = correctSSML(output);
    this._insertValue(output, context);
  },
  random: function(values, context){
    let value = values[Math.floor(Math.random()*values.length)];
    if(typeof value === 'string'){
      return this.say(value, context);
    } else {
      return processSelection(value, context);
    }
  },
  break: function(value, context){
    this._insertValue(` <break strength="${value}"/> `, context);
  },
  pause: function(value, context){
    this._insertValue(` <break time="${value}"/> `, context);
  },
  audio: function(value, context){
    this._insertValue(` <audio src="${value}"/>  `, context);
  },
  'en-US': function(value, context){
    if((!context.requestBody.locale) || context.requestBody.locale === 'en-US'){
      if(typeof value === 'string'){
        return this.say(value, context);
      } else {
        return processSelection(value, context);
      }
    }
  },
  'en-GB': function(value, context){
    if(context.requestBody.locale === 'en-GB'){
      if(typeof value === 'string'){
        return this.say(value, context);
      } else {
        return processSelection(value, context);
      }
    }
  },
  'de-DE': function(value, context){
    if(context.requestBody.locale === 'de-DE'){
      if(typeof value === 'string'){
        return this.say(value, context);
      } else {
        return processSelection(value, context);
      }
    }
  },
  _insertValue: function(value, context){
    context.responseBody.outputSpeech.ssml  = context.responseBody.outputSpeech.ssml.replace(/<\/speak>/, '');
    context.responseBody.outputSpeech.ssml += (`${value} </speak>` || '');    
  }
};

function processSelection(selection, context) {
  if(Array.isArray(selection)){
    selection.forEach(value => processSelection(value, context));
  } else if((typeof selection === 'string') || (typeof selection === 'number')){
    functions['say'](selection, context);
  } else if (selection instanceof Object && !(selection instanceof Array)){
    Object.keys(selection).forEach(k => {
      let func = (functions[k] || function(){}).bind(functions);
      func(selection[k], context);
    });
  }
}

module.exports = (input, context) => {
  if(!input){ return; }
  context.responseBody.outputSpeech = context.responseBody.outputSpeech || {
    type: "SSML", 
    ssml: "<speak></speak>"
  };
  processSelection(input, context);
}

