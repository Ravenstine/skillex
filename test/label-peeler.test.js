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

  describe('error:', function(){

    it('deals with script errors', (done) => {
      let ctx = generateContext({});
      peelLabel({
        script: 'throw "there is a problem"',
        ask: 'How do you feel?',
        'go to': 'some other label',
        error: {
          'go to': 'error label'
        }
      }, ctx)
        .then(() => {
          assert.equal(ctx.get('navigator.currentLabelName'), 'error label');
          done();
        });
    });

    it('deals with handlebars errors', (done) => {
      let ctx = generateContext({});
      peelLabel({
        say: '{{ #each this}}{{ /each}}',
        error: {
          'go to': 'error label'
        }
      }, ctx)
        .then(() => {
          assert.equal(ctx.get('navigator.currentLabelName'), 'error label');
          done();
        });
    });

    it('passes on errors if not specified', (done) => {
      let ctx = generateContext({});
      peelLabel({
        script: 'throw "there is a problem"',
      }, ctx)
        .catch(err => {
          assert.ok(err);
          done();
        });
    });


  });

});

