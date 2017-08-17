'use strict';

const assert    = require('assert');
const condition = require('../lib/condition');

describe('operators', function(){
  let context = {
    attributes: {
      hasTreasure: true
    },
    sessionAttributes: {

    }
  };

  it('navigates based on a value', function(){
    let sampleCondition = {
      value: "attributes.hasTreasure",
      'if true': {
        'go to': 'win' 
      },
      'if false': {
        'go to': 'lose'
      }
    }
    condition(sampleCondition, context);
    assert.equal(context.sessionAttributes.LABEL, 'win');
  });
  
});

