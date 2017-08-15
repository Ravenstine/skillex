'use strict';

const pillBox = require('./lib/pill-box')('./pills');
const compile = require('./lib/compile');
const fs      = require('fs');

let schema    = compile(pillBox);

let json      = JSON.stringify(schema, null, 2 ); 

let date      = new Date().getTime().toString();

fs.writeFileSync(`schemas/intent-schema-${date}.json`, json);

