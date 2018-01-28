'use strict';

const assert      = require('assert');
const card        = require('../lib/builders/card');
const generateContext = require('../lib/context-generator');


describe('operators', function(){
  let context = generateContext();
  it('adds a simple card object to the response', function(){
    let cardInput = {title: "hello", content: "hello world"};
    card(cardInput, context);
    assert.deepEqual({type: "Simple", title: "hello", content: "hello world"}, context.responseBody.card);
  });
  
});

