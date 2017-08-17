'use strict';

const assert      = require('assert');
const card  = require('../lib/card');

describe('operators', function(){
  let context = {
    attributes: {
    },
    response: {

    },
    responseBody: {}
  };

  it('adds a simple card object to the response', function(){
    let cardInput = {title: "hello", content: "hello world"};
    card(cardInput, context);
    assert.deepEqual({type: "Simple", title: "hello", content: "hello world"}, context.responseBody.card);
  });
  
});

