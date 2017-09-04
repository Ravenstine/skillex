'use strict';

const assert          = require('assert');
const cutPill         = require('../lib/pill-cutter');

describe('speak', function(){

  it('omits template objects', function(){
    let pill = {
      ".some-template" : {
        speak: 'goodbye world'
      },
      entrypoint: {
        speak: 'hello world'
      }
    }
    cutPill(pill);
    assert.equal(pill.hasOwnProperty('.some-template'), false);
  });
  
});

