'use strict';

const assign     = require('./assign');
const coffeeEval = require('./coffee-eval');

module.exports = (condition, context) => {
  if(typeof condition !== 'object'){ return; }

  let truthiness = coffeeEval(condition.expression || condition.value, context) ? true : false;

  let conditionResult = (truthiness ? condition['if true'] : condition['if false']) || {};

  // assign:
  assign(conditionResult.assign, context);

  console.log(conditionResult)

  // go to:
  if(conditionResult.hasOwnProperty('go to')) {
    context.attributes.LABEL = conditionResult['go to'];
  }

}

