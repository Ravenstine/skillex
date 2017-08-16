'use strict';

const coffeeEval = require('./coffee-eval');
const evalString = require('./eval-string');
const chrono     = require('chrono-node');

// note that this is used for both `assign:` and `temp:`, and possibly more things in the future.

const operations = {
  set(k, v, assignee, context){
    if(typeof v === 'string'){
      assignee[k] = evalString(v, context);
    } else {
      assignee[k] = v;
    }
  },
  increment(k, v, assignee, context){
    let initialValue = assignee[k];
    if(!initialValue){
      // if there is no initial value, just assign
      // the incremental value we were given
      assignee[k] = v;
    } else if (typeof initialValue === 'number' || typeof initialValue === 'string') {
      let parsedInitial = parseFloat(initialValue);
      let parsedValue   = parseFloat(v);
      if(parsedInitial !== NaN && parsedValue !== NaN){
        assignee[k] = parsedInitial + parsedValue;
      }
    }
  },
  erase(k, v, assignee, context) {
    delete assignee[k];
  },
  append(k, v, assignee, context) {
    let initialValue = assignee[k];
    if(!initialValue) {
      // pretend like nothing's wrong and just
      // assign the current value
      assignee[k] = v;
    } else if (Array.isArray(initialValue)) {
      assignee[k].push(v);
    } else if (typeof initialValue === 'string') {
      if(typeof v !== 'object' && typeof v !== void(0)){
        // objects would just append weirdly to strings
        // so we're just never going to do it
        assignee[k] += v;
      }
    } else if ((typeof initialValue === 'number') && (typeof v !== 'object') && (typeof v !== void(0))) {
      assignee[k] = `${initialValue}${v}`;
    }
  },
  prepend(k, v, assignee, context) {
    // sort of the reverse of what happens in #append
    let initialValue = assignee[k];
    if(!initialValue) {
      assignee[k] = v;
    } else if (Array.isArray(initialValue)) {
      assignee[k].unshift(v);
    } else if (typeof initialValue === 'string') {
      if(typeof v !== 'object' && typeof v !== void(0)){
        // objects would just append weirdly to strings
        // so we're just never going to do it
        assignee[k] = evalString(v, context) + assignee[k];
      }
    } else if ((typeof initialValue === 'number') && (typeof v !== 'object') && (typeof v !== void(0))) {
      assignee[k] = `${v}${initialValue}`;
    }
  },
  multiply(k, v, assignee, context) {
    let initialValue = parseFloat(assignee[k]);
    let newValue     = parseFloat(v);
    if((initialValue !== NaN) && (newValue !== NaN)){
      assignee[k] = initialValue * newValue;
    }
  },
  min(k, v, assignee, context) {
    let initialValue = parseFloat(assignee[k]);
    if(initialValue < v){
      assignee[k] = v;
    }
  },
  max(k, v, assignee, context) {
    let initialValue = parseFloat(assignee[k]);
    if(initialValue > v){
      assignee[k] = v;
    }
  },
  date(k, v, assignee, context) {
    // currently the safest way to add dates to attributes
    if(Object.prototype.toString.call(v) === '[object Date]'){
      assignee[k] = v;
    } else if ((typeof v === 'string') || (typeof v === 'number')) {
      // human date string parsing! 😮
      let parsedDate = chrono.parseDate(evalString(v, context));
      if(parsedDate){
        assignee[k] = parsedDate;
      }
    }
  },
  expression(k, v, assignee, context) {
    // assign the result of a CoffeeScript
    let tempContext = {x: assignee[k]};
    Object.assign(tempContext, context);
    if(typeof v === 'string'){
      assignee[k] = coffeeEval(v, tempContext);
    }
  },
  slot(k, v, assignee, context) {
    // if the context has a slot from an intent,
    // store the slot value as a session attribute
    let slotValue = context.slots[v];
    if(slotValue){
      assignee[k] = slotValue;
    }
  }
};

function performOperations(assignee, assigner, context){
  Object.keys(assigner).forEach((opName) => {
    Object.keys(assigner[opName]).forEach((k) => {
      let v = assigner[opName][k];
      operations[opName](k, v, assignee, context);
    });
  });
}

module.exports = (assignee, assignments, context) => {
  // `assign:` can either be a singular operation object
  // or an array of multiple operation objects
  if(!assignments){ return; }
  if(Array.isArray(assignments)){
    assignments.forEach(op => performOperations(assignee, op, context));
  } else if (typeof assignments === 'object') {
    performOperations(assignee, assignments, context);
  }
}

