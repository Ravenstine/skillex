'use strict';

const assert  = require('assert');
const assign  = require('../lib/assign');

describe('operators', function(){
  let context = {
    attributes: {
      setTest: undefined,
      stringTest: 'hello',
      numberTest: 0,
      arrayTest: [1,2,3],
      objectTest: {},
      dateTest: undefined,
      nullText: null,
      eraseTest: 'erase me!',
      expressionTest: undefined
    },
    slots: {
      foo: 'bar'
    }
  };

  it('increments an attribute', function(){
    assign({
      increment: {
        numberTest: 3
      }
    }, context);
    assert.equal(context.attributes.numberTest, 3);
  });

  it('increments a non-zero attribute', function(){
    assign({
      increment: {
        numberTest: 3
      }
    }, context);
    assert.equal(context.attributes.numberTest, 6);
  });

  it('decrements an attribute', function(){
    assign({
      increment: {
        numberTest: -2
      }
    }, context);
    assert.equal(context.attributes.numberTest, 4);
  });

  it('does not try to increment a non-number', function(){
    let originalObject = context.attributes.objectTest;
    assign({
      increment: {
        objectTest: -2
      }
    }, context);
    assert.equal(context.attributes.objectTest, originalObject);
  });

  it('erases attributes', function(){
    let originalObject = context.attributes.objectTest;
    assign({
      erase: {
        eraseTest: undefined 
      }
    }, context);
    assert.equal(Object.keys(context.attributes).indexOf('eraseTest'), -1);
  });

  it('appends items to an array', function(){
    assign({
      append: {
        arrayTest: 4 
      }
    }, context);
    assert.equal(context.attributes.arrayTest[context.attributes.arrayTest.length - 1], 4);
  });

  it('prepends items to an array', function(){
    assign({
      prepend: {
        arrayTest: 5
      }
    }, context);
    assert.equal(context.attributes.arrayTest[0], 5);
  });

  it('can assign a date', function(){
    assign({
      date: {
        dateTest: 'today'
      }
    }, context);
    let isDate = Object.prototype.toString.call(context.attributes.dateTest) === '[object Date]';
    assert.equal(isDate, true);
  });

  it('can assign from an expression', function(){
    assign({
      expression: {
        expressionTest: '40 + 2'
      }
    }, context);
    assert.equal(context.attributes.expressionTest, 42);
  });

  it('can assign from an intent slot', function(){
    assign({
      slot: {
        baz: 'foo'
      }
    }, context);
    assert.equal(context.attributes.baz, 'bar');
  });


});