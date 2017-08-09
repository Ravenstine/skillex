'use strict';

const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const chrono     = require('chrono-node');

const operations = {
  set(k, v, context){
    if(typeof v === 'string'){
      context.attributes[k] = evalString(v, context);
    } else {
      context.attributes[k] = v;
    }
  },
  increment(k, v, context){
    let initialValue = context.attributes[k];
    if(!initialValue){
      // if there is no initial value, just assign
      // the incremental value we were given
      context.attributes[k] = v;
    } else if (typeof initialValue === 'number' || typeof initialValue === 'string') {
      let parsedInitial = parseFloat(initialValue);
      let parsedValue   = parseFloat(v);
      if(parsedInitial !== NaN && parsedValue !== NaN){
        context.attributes[k] = parsedInitial + parsedValue;
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
        context.attributes[k] = evalString(v, context) + context.attributes[k];
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
      let parsedDate = chrono.parseDate(evalString(v, context));
      if(parsedDate){
        context.attributes[k] = parsedDate;
      }
    }
  },
  expression(k, v, context) {
    // assign the result of a CoffeeScript
    let tempContext = {x: context.attributes[k]};
    Object.assign(tempContext, context);
    if(typeof v === 'string'){
      context.attributes[k] = coffeeEval(v, tempContext);
    }
  },
  slot(k, v, context) {
    // if the context has a slot from an intent,
    // store the slot value as a session attribute
    let slotValue = context.slots[v];
    if(slotValue){
      context.attributes[k] = slotValue;
    }
  }
};

function performOperations(op, context){
  Object.keys(op).forEach((opName) => {
    let value = op[opName];
    let k     = Object.keys(value)[0];
    let v     = value[k];
    if(typeof v === 'string'){
      v = evalString(v, context);
    }
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

