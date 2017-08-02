'use strict';

const assert  = require('assert');
const handler = require('../lib/handler')(`test/mocks/pills`);

describe('LaunchRequest', function(){
  let launchMock = require('./mocks/requests/launch');
  it('responds with the dialog of the first label of the entrypoint', function(done){
    handler(null, launchMock, function(err, data){
      assert.equal(data.response.outputSpeech.text, 'Welcome to Spooky House.  The object of this game is to get to the exit with treasure and not get killed.');
      done();
    });
  });
});

