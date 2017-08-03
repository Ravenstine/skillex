'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml');
const glob     = require('glob-fs')({ gitignore: true });

function loadPillYaml(pillsDirectory, pillName){
  let yaml     = fs.readFileSync(`${pillsDirectory}/${pillName}.yml`, 'utf8');
  let segments = yaml.split(/[\-]{3,}/); // a set of 3 or more dashes denotes a section
  let metadata, imports;
  let pill     = [];
  if(segments.length > 1){
    metadata   = YAML.safeLoad(segments[0]) || {}; // parse metadata section
    yaml       = segments[1];
    if(typeof metadata.import === 'string'){
      imports = [metadata.import];
    } else {
      imports = metadata.import || [];
    }
    // If other pills are listed under import: in the metadata section,
    // load them and prepend to the current pill YAML text in order.
    imports.forEach(pillName => pill.push(loadPillYaml(pillsDirectory, pillName)));
  }
  pill.push(yaml);
  return pill.join('\r\n');
}

module.exports = (pillsDirectory) => {

  let pills = {};

  glob.readdirSync(`${pillsDirectory}/**/*.yml`).forEach((f) => {
    let pillKey = f.replace(pillsDirectory, "").match(/\/([\w|-|\/]+)\.yml/)[1];
    if(pillKey){
      pills[pillKey] = YAML.safeLoad(loadPillYaml(pillsDirectory, pillKey));
    }
  });

  return pills;

}

