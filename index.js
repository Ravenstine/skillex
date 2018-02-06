'use strict';

const skillset   = require('./lib/skillset');

module.exports  = (scenesDirectory) => {
  return require('./lib/handler')(skillset(scenesDirectory));
}

