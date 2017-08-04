'use strict';

let coffeeEval = require('./coffee-eval');

module.exports = (string, context) => {
  if(!string) {return '';}
  let template = string.replace(/\${/g, '#{');
  // ☝ sadly, coffeescript template literals are incompatible with YAML strings
  // so we have to format them like ES6 and convert them back before evaluating
  return coffeeEval(`"${template}"`, context);
}

