'use strict';

const assert          = require('assert');
const speak           = require('../lib/builders/speak');
const generateContext = require('../lib/context-generator');

describe('speak', function(){

  it('takes a string', function(){
    let context = generateContext();
    speak('hello world', context);
    assert.equal(context.responseBody.outputSpeech.ssml, '<speak>hello world </speak>');
  });

  it('takes a locale object and defaults to english', function(){
    let context = generateContext();
    speak({'en-US': 'hello world'}, context);
    assert.equal(context.responseBody.outputSpeech.ssml, '<speak>hello world </speak>');
  });

  it('selects the locale in the context', function(){
    let context = generateContext();
    context.requestBody.locale = 'de-DE';
    speak({'en-US': 'hello world', 'de-DE': 'hallo welt'}, context);
    assert.equal(context.responseBody.outputSpeech.ssml, '<speak>hallo welt </speak>');
  });

  it('picks a random string from an array', function(){
    let context = generateContext();
    speak(['bananas', 'oranges', 'apples'], context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/apples|bananas|oranges/) ? true : false;
    assert.equal(didMatch, true);
  });

  it('picks a random string from a locale array', function(){
    let context = generateContext();
    speak({'en-US': ['bananas', 'oranges', 'apples']}, context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/apples|bananas|oranges/) ? true : false;
    assert.equal(didMatch, true);
  });
  
});

