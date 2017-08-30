'use strict';

const pillBox   = require('./lib/pill-box');

module.exports  = (pillsDirectory) => {
  return require('./lib/handler')(pillBox(pillsDirectory));
}

