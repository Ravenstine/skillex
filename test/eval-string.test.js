'use strict';

const assert      = require('assert');
const evalString  = require('../lib/eval-string');

describe('operators', function(){
  let context = {
    attributes: {
    }
  };

  it('processes template strings', function(){
    let evaluation = evalString('The result is ${1 + 2}.', context);
    assert.equal(evaluation, 'The result is 3.');
  });

  it('replaces with empty strings when undefined/null/NaN are passed', function(){
    let evaluation = evalString('This is a ${undefined} string.', context);
    assert.equal(evaluation, 'This is a  string.');
  });
  
});

