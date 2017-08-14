'use strict';

const assert  = require('assert');
const assign  = require('../lib/assign');

describe('operators', function(){
  let context = {
    attributes: {
      setTest: undefined,
      stringTest: 'hello',
      numberTest: 0,
      stringNumberTest: '3',
      arrayTest: [1,2,3],
      objectTest: {},
      dateTest: undefined,
      nullText: null,
      eraseTest: 'erase me!',
      expressionTest: undefined,
      booleanTest: undefined
    },
    slots: {
      foo: 'bar'
    }
  };

  it('sets a boolean', function(){
    assign(context.attributes, {
      set: {
        booleanTest: true
      }
    }, context);
    assert.equal(context.attributes.booleanTest, true);
  })

  it('increments a number attribute', function(){
    assign(context.attributes, {
      increment: {
        numberTest: 3
      }
    }, context);
    assert.equal(context.attributes.numberTest, 3);
  });

  it('increments a string attribute', function(){
    assign(context.attributes, {
      increment: {
        stringNumberTest: 4
      }
    }, context);
    assert.equal(context.attributes.stringNumberTest, 7);
  });

  it('increments a number attribute with a string', function(){
    assign(context.attributes, {
      increment: {
        numberTest: '2'
      }
    }, context);
    assert.equal(context.attributes.numberTest, 5);
  });

  it('increments a non-zero attribute', function(){
    assign(context.attributes, {
      increment: {
        numberTest: 3
      }
    }, context);
    assert.equal(context.attributes.numberTest, 8);
  });

  it('decrements an attribute', function(){
    assign(context.attributes, {
      increment: {
        numberTest: -2
      }
    }, context);
    assert.equal(context.attributes.numberTest, 6);
  });

  it('does not try to increment a non-number', function(){
    let originalObject = context.attributes.objectTest;
    assign(context.attributes, {
      increment: {
        objectTest: -2
      }
    }, context);
    assert.equal(context.attributes.objectTest, originalObject);
  });

  it('erases attributes', function(){
    let originalObject = context.attributes.objectTest;
    assign(context.attributes, {
      erase: {
        eraseTest: undefined 
      }
    }, context);
    assert.equal(Object.keys(context.attributes).indexOf('eraseTest'), -1);
  });

  it('appends items to an array', function(){
    assign(context.attributes, {
      append: {
        arrayTest: 4 
      }
    }, context);
    assert.equal(context.attributes.arrayTest[context.attributes.arrayTest.length - 1], 4);
  });

  it('prepends items to an array', function(){
    assign(context.attributes, {
      prepend: {
        arrayTest: 5
      }
    }, context);
    assert.equal(context.attributes.arrayTest[0], 5);
  });

  it('can assign a date', function(){
    assign(context.attributes, {
      date: {
        dateTest: 'today'
      }
    }, context);
    let isDate = Object.prototype.toString.call(context.attributes.dateTest) === '[object Date]';
    assert.equal(isDate, true);
  });

  it('can assign from an expression', function(){
    assign(context.attributes, {
      expression: {
        expressionTest: '40 + 2'
      }
    }, context);
    assert.equal(context.attributes.expressionTest, 42);
  });

  it('can assign from an intent slot', function(){
    assign(context.attributes, {
      slot: {
        baz: 'foo'
      }
    }, context);
    assert.equal(context.attributes.baz, 'bar');
  });

});

