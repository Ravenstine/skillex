'use strict';

const coffeeEval = require('./coffee-eval');
const chrono     = require('chrono-node');

const operations = {
  set(k, v, context){
    context.attributes[k] = v;
  },
  increment(k, v, context){
    let initialValue = context.attributes[k];
    if(!initialValue){
      // if there is no initial value, just assign
      // the incremental value we were given
      context.attributes[k] = v;
    } else if (typeof initialValue === 'number') {
      context.attributes[k] += v;
    } else if (typeof initialValue === 'string') {
      let parsedValue = parseFloat(initialValue);
      if(parsedValue !== NaN){
        context.attributes[k] = parsedValue + v;
      }
    }
  },
  erase(k, v, context) {
    delete context.attributes[k];
  },
  append(k, v, context) {
    let initialValue = context.attributes[k];
    if(!initialValue) {
      // pretend like nothing's wrong and just
      // assign the current value
      context.attributes[k] = v;
    } else if (Array.isArray(initialValue)) {
      context.attributes[k].push(v);
    } else if (typeof initialValue === 'string') {
      if(typeof v !== 'object' && typeof v !== void(0)){
        // objects would just append weirdly to strings
        // so we're just never going to do it
        context.attributes[k] += v;
      }
    } else if ((typeof initialValue === 'number') && (typeof v !== 'object') && (typeof v !== void(0))) {
      context.attributes[k] = `${initialValue}${v}`;
    }
  },
  prepend(k, v, context) {
    // sort of the reverse of what happens in #append
    let initialValue = context.attributes[k];
    if(!initialValue) {
      context.attributes[k] = v;
    } else if (Array.isArray(initialValue)) {
      context.attributes[k].unshift(v);
    } else if (typeof initialValue === 'string') {
      if(typeof v !== 'object' && typeof v !== void(0)){
        // objects would just append weirdly to strings
        // so we're just never going to do it
        context.attributes[k] = v + context.attributes[k];
      }
    } else if ((typeof initialValue === 'number') && (typeof v !== 'object') && (typeof v !== void(0))) {
      context.attributes[k] = `${v}${initialValue}`;
    }
  },
  multiply(k, v, context) {
    let initialValue = parseFloat(context.attributes[k]);
    let newValue     = parseFloat(v);
    if((initialValue !== NaN) && (newValue !== NaN)){
      context.attributes[k] = initialValue * newValue;
    }
  },
  min(k, v, context) {
    let initialValue = parseFloat(context.attributes[k]);
    if(initialValue < v){
      context.attributes[k] = v;
    }
  },
  max(k, v, context) {
    let initialValue = parseFloat(context.attributes[k]);
    if(initialValue > v){
      context.attributes[k] = v;
    }
  },
  date(k, v, context) {
    // currently the safest way to add dates to attributes
    if(Object.prototype.toString.call(v) === '[object Date]'){
      context.attributes[k] = v;
    } else if ((typeof v === 'string') || (typeof v === 'number')) {
      // human date string parsing! 😮
      let parsedDate = chrono.parseDate(v);
      if(parsedDate){
        context.attributes[k] = parsedDate;
      }
    }
  },
  lambda(k, v, context) {
    if(typeof v === 'string'){
      context.attributes[k] = coffeeEval(v, {x: context.attributes[k]});
    }
  }
};

function performOperations(op, context){
  Object.keys(op).forEach((opName) => {
    let value = op[opName];
    let k     = Object.keys(value)[0];
    let v     = value[k];
    operations[opName](k, v, context);
  });
}

module.exports = (assignments, context) => {
  // `assign:` can either be a singular operation object
  // or an array of multiple operation objects
  if(!assignments){ return; }
  if(Array.isArray(assignments)){
    assignments.forEach(op => performOperations(op, context));
  } else if (typeof assignments === 'object') {
    performOperations(assignments, context);
  }
}

