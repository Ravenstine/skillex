'use strict';

const assert            = require('chai').assert;
const peelLabel         = require('../lib/label-peeler');
const generateContext   = require('../lib/context-generator');
const helloWorldRequest = require('./mocks/requests/hello-world');

describe('label-peeler', function(){

  it('navigates to a label', (done) => {
    let context = generateContext({});
    peelLabel({
      'go to': 'some other label'
    }, context)
      .then(() => {
        assert.isTrue(context.get('navigator.hasNavigated'));
        done();
      });
  });

  it('navigates to a scene', (done) => {
    let context = generateContext({});
    peelLabel({
      'go to scene': 'some other scene'
    }, context)
      .then(() => {
        assert.isTrue(context.get('navigator.hasNavigated'));
        assert.equal(context.get('navigator.currentSceneName'), 'some other scene');
        done();
      });
  });

  // it('navigates between multiple labels', (done) => {
  //   let scenes = {
  //     entrypoint: {
  //       'label 1': {
  //         'go to': 'label 2'
  //       },
  //       'label 2': {
  //         'go to': 'label 3'
  //       },
  //       'label 3': {
  //         'go to': 'label 4'
  //       }
  //     }
  //   };
  //   let context = generateContext({},{},scenes);
  //   peelLabel(scenes['entrypoint']['label 1'], context)
  //     .then(() => {
  //       function foo () { console.log(context);}
  //       debugger
  //       done();
  //     });
  // });

  it('finishes state', (done) => {
    let context = generateContext(helloWorldRequest);
    peelLabel({
      'go to': 'some label',
      'intents': {
        'NavigatorIntent': {
          'finish': true
        }
      }
    }, context)
      .then(() => {
        assert.notExists(context.get('navigator.currentSceneName'));
        assert.notExists(context.get('navigator.currentLabelName'));
        done();
      });
  })
  
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

