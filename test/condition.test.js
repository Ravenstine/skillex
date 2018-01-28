'use strict';

const assert          = require('assert');
const generateContext = require('../lib/context-generator');
const condition       = require('../lib/builders/condition');

describe('operators', function(){
  let context = generateContext();

  it('navigates if script return value is truthy', function(){
    let label = {
      'if true': {
        'go to': 'some label'
      },
      'if false': {
        'go to': 'wrong label'
      }
    };
    condition(label, context, true);
    assert.equal(context.navigator.currentLabelName, 'some label');
  });

  it('navigates if script return value is falsy', function(){
    let label = {
      'if true': {
        'go to': 'wrong label'
      },
      'if false': {
        'go to': 'some label'
      }
    };
    condition(label, context, false);
    assert.equal(context.navigator.currentLabelName, 'some label');
  });
  
});

