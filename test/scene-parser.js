'use strict';

const assert     = require('chai').assert;
const parseScene = require('../lib/scene-parser');


describe('scene parser', function(){

  it('handles comma-separated intents', () => {
    let scene = {
      'intro': {
        'say': 'Hello world',
        'intents': {
          'FirstIntent,SecondIntent': {
            replay: null
          }
        }
      }
    };

    parseScene(scene);
    let intents = scene.intro.intents;
    
    assert.ok(intents.FirstIntent);
    assert.ok(intents.SecondIntent);
    assert.equal(intents.FirstIntent, intents.SecondIntent);
    assert.notOk(intents['FirstIntent,SecondIntent']);

  });

  it('removes hidden labels', () => {
    let scene = {
      '.hidden': {
        'say': 'Hello world',
        }
    };

    parseScene(scene);

    assert.equal(Object.keys(scene).length, 0);

  });

});

