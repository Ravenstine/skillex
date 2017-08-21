'use strict';

const pillBox = require('./lib/pill-box');

exports.handler = require('./lib/handler')(pillBox('./pills'));

