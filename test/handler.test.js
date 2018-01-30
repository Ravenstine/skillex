'use strict';

const assert  = require('assert');
const skillset = require('../lib/skillset');
const LaunchRequest = require('./mocks/requests/launch');

let handler = require('../lib/handler')(skillset('./scenes'));

describe('handler', function(){

  it('responds to a LaunchRequest', (done) => {

    handler(LaunchRequest, {}, (err, resp) => {
      assert.ok(resp.response.outputSpeech.ssml);
      done();
    });

  });

});

