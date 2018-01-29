'use strict';

const assert  = require('assert');
const pillBox = require('../lib/pill-box');
const LaunchRequest = require('./mocks/requests/launch');

let handler = require('../lib/handler')(pillBox('./pills'));

describe('handler', function(){

  it('responds to a LaunchRequest', (done) => {

    handler(LaunchRequest, {}, (err, resp) => {
      assert.ok(resp.response.outputSpeech.ssml);
      done();
    });

  });

});

