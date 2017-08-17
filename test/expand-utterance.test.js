'use strict';

const assert       = require('assert');
const expandUtterance = require('../lib/expand-utterance');

describe('expand-utterance', function(){

  let matcher = '(i would|i\'d) like [count:AMAZON.NUMBER] [snack:CustomType] [when:UnknownType]';

  let impliedTypeUtterance = 'look ma!  no [number] types!';

  let intent = {
    types: {
      CustomType: {
        values: [
          'apples',
          'oranges',
          'peanuts'
        ]
      }
    }
  };

  it('guesses an implied built-in type', function(){
    expandUtterance(impliedTypeUtterance, intent);
    // assert.deepEqual
  });
  
});



