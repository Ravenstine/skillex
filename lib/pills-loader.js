'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml');
const glob     = require('glob-fs')({ gitignore: true });

module.exports = (pillsDirectory) => {

  let pills = {};

  glob.readdirSync(`${pillsDirectory}/**/*.yml`).forEach((f) => {
    let pillKey = f.replace(pillsDirectory, "").match(/\/([\w|-|\/]+)\.yml/)[1];
    if(pillKey){
      pills[pillKey] = YAML.safeLoad(fs.readFileSync(f, 'utf8'));
    }
  });

  return pills;

}

