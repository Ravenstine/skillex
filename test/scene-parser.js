'use strict';

const assert     = require('chai').assert;
const parseScene = require('../lib/scene-parser');


describe('scene parser', function(){

  it('handles comma-separated actions', () => {
    let scene = {
      'intro': {
        'say': 'Hello world',
        'actions': {
          'FirstIntent,SecondIntent': {
            replay: null
          }
        }
      }
    };

    parseScene(scene);
    let actions = scene.intro.actions;
    
    assert.ok(actions.FirstIntent);
    assert.ok(actions.SecondIntent);
    assert.equal(actions.FirstIntent, actions.SecondIntent);
    assert.notOk(actions['FirstIntent,SecondIntent']);

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

