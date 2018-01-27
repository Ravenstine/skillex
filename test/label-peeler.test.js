'use strict';

const assert    = require('chai').assert;
const peelLabel = require('../lib/label-peeler');
const generateContext = require('../lib/context-generator');

describe('label-peeler', function(){

  it('navigates', (done) => {
    let context = generateContext({});
    peelLabel({
      'go to': 'some other label'
    }, context)
      .then(() => {
        assert.isTrue(context.get('navigator.hasNavigated'));
        done();
      });
  });
  
  it('prevents toplevel navigation when waiting for user response', (done) => {
    let context = generateContext({});
    peelLabel({
      ask: 'How do you feel?',
      'go to': 'some other label'
    }, context)
      .then(() => {
        assert.isFalse(context.get('navigator.hasNavigated'));
        done();
      });
  });

});

