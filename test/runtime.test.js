'use strict';

const assert            = require('chai').assert;
const generateContext   = require('../lib/context-generator');
const runtime         = require('../lib/runtime');
const foobarIntentRequest = require('./mocks/requests/foobar-intent');




describe('runtime', function(){

  it('runs a label that returns speech', (done) => {
    let scenes = {
      entrypoint: {
        'intro': {
          'say': 'Hello cruel world'
        }
      }
    };
    let context = generateContext(null,null,scenes);
    runtime(context, scenes)
      .then(context => {
        assert.ok(context.get('responseBody.outputSpeech.ssml').match('Hello cruel world'));
        done();
      });
  });

  it('runs through multiple labels', (done) => {
    let scenes = {
      entrypoint: {
        'label 1': {
          say: 'hello',
          'go to': 'label 2'
        },
        'label 2': {
          say: 'cruel',
          'go to': 'label 3'
        },
        'label 3': {
          say: 'world',
          'go to': 'label 4'
        }
      }
    };
    let context = generateContext(null,null,scenes);
    runtime(context, scenes)
      .then(context => {
        assert.equal(context.get('navigator.currentLabelName'), 'label 4');
        assert.ok(context.get('responseBody.outputSpeech.ssml').match('hello cruel world'));
        done();
      });
  });


  it('honors the repeat option', (done) => {
    let scenes = {
      entrypoint: {
        'label 1': {
          say: 'hello',
          ask: 'baz?',
          actions: {
            FoobarIntent: {
              repeat: null
            }
          }
        },
        'label 2': {
          say: 'cruel',
          'go to': 'label 3'
        },
        'label 3': {
          say: 'world',
          'go to': 'label 4'
        }
      }
    };
    let context = generateContext(foobarIntentRequest,null,scenes);
    runtime(context, scenes)
      .then(context => {
        assert.equal(context.get('navigator.currentLabelName'), 'label 1');
        assert.ok(context.get('responseBody.outputSpeech.ssml').match('hello'));
        done();
      });
  });


  it('repeats a question only without the main speech or cards', (done) => {
    let scenes = {
      entrypoint: {
        'label 1': {
          say: 'hello',
          ask: 'baz?',
          actions: {
            FoobarIntent: {
              repeat: 'question'
            }
          }
        }
      }
    };
    let context = generateContext(foobarIntentRequest,null,scenes);
    context.set('sessionAttributes.WAITING', true);
    context.set('sessionAttributes.LABEL', 'label 1');
    runtime(context, scenes)
      .then(context => {
        assert.equal(context.get('navigator.currentLabelName'), 'label 1');
        assert.notOk(context.getWithDefault('responseBody.outputSpeech.ssml', '').match('hello'));
        assert.ok(context.get('responseBody.outputSpeech.ssml').match('baz?'));
        done();
      });
  });






});

