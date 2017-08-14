'use strict';

const pillBox = require('./lib/pill-box')('./pills');
const compile = require('./lib/compile');

let schema    = compile(pillBox);

console.log(JSON.stringify(schema, null, 2 )); 

