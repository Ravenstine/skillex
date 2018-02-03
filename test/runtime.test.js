'use strict';

const assert            = require('chai').assert;
// const peelLabel         = require('../lib/label-peeler');
const generateContext   = require('../lib/context-generator');
// const helloWorldRequest = require('./mocks/requests/hello-world');
const runtime         = require('../lib/runtime');



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

});

