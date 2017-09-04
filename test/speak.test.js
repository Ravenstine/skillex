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

  it('joins an array', function(){
    let context = generateContext();
    speak(['bananas', 'oranges', 'apples'], context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/apples|bananas|oranges/) ? true : false;
    assert.equal(didMatch, true);
  });

  it('joins a locale array', function(){
    let context = generateContext();
    speak({'en-US': ['bananas', 'oranges', 'apples']}, context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/apples|bananas|oranges/) ? true : false;
    assert.equal(didMatch, true);
  });

  it('picks random string from array', function(){
    let context = generateContext();
    speak({'en-US': {'random': ['bananas', 'oranges', 'apples']}}, context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/apples|bananas|oranges/) ? true : false;
    assert.equal(didMatch, true);
  });

  it('inserts a break', function(){
    let context = generateContext();
    speak([
      "hello",
      {break: 'medium'},
      "workd"
    ], context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/<break strength="medium"\/>/) ? true : false;
    assert.equal(didMatch, true);
  });

  it('inserts a timed pause', function(){
    let context = generateContext();
    speak([
      "hello",
      {pause: '2s'},
      "workd"
    ], context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/<break time="2s"\/>/) ? true : false;
    assert.equal(didMatch, true);
  });

  it('inserts audio', function(){
    let context = generateContext();
    speak([
      "hello",
      {audio: 'http://test.audio'},
      "workd"
    ], context);
    let didMatch = context.responseBody.outputSpeech.ssml.match(/<audio src="http:\/\/test.audio"\/>/) ? true : false;
    assert.equal(didMatch, true);
  });
  
});

