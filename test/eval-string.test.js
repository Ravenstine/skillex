'use strict';

const assert      = require('assert');
const evalString  = require('../lib/eval-string');
const generateContext = require('../lib/context-generator');

describe('operators', function(){
  let context = generateContext();

  it('can do basic math', function(){
    let evaluation = evalString('The result is {{add 1 2}}.', context);
    assert.equal(evaluation, 'The result is 3.');
  });

  it('replaces with empty strings when undefined/null/NaN are passed', function(){
    let evaluation = evalString('This is a {{someUndefinedvariable}} string.', context);
    assert.equal(evaluation, 'This is a  string.');
  });
  
});

