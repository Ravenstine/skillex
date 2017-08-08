'use strict';

const assert  = require('assert');
const assign  = require('../lib/assign-nuevo');

describe('operators', function(){
  it('increments an attribute', function(){
    let a = {value: 0};
    let b = {value: '++'};
    assign(a, b);
    assert.equal(a.value, 1, {});
    // handler(null, launchMock, function(err, data){
    //   assert.equal(data.response.outputSpeech.text, 'Welcome to Spooky House.  The object of this game is to get to the exit with treasure and not get killed.');
    //   done();
    // });
  });
});