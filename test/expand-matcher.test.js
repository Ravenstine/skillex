'use strict';

const assert       = require('assert');
const expandMatcher = require('../lib/expand-matcher');

describe('expand-matcher', function(){

  let matcher = '(i would|i\'d) like [count:AMAZON.NUMBER] [snack:CustomType] [when:UnknownType]';

  let impliedTypeMatcher = 'look ma!  no [number] types!';

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
    expandMatcher(impliedTypeMatcher, intent);
    debugger
    // assert.deepEqual
  });
  
});



