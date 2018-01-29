'use strict';

const skillset   = require('./lib/skillset');

module.exports  = (statesDirectory) => {
  return require('./lib/handler')(skillset(statesDirectory));
}

