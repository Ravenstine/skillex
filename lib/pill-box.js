'use strict';

// The "pill box" is simply the object of pills that is used
// by the application.  All we really do here is traverse the
// directory of pills and process them.  It is used for both
// runtime and compilation.

const fs                = require('fs');
const YAML              = require('js-yaml');
const glob              = require('glob-fs')({ gitignore: true });
const cutPill           = require('./pill-cutter');

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
    // match the name of the pill from the file name
    let pillKey = f.replace(pillsDirectory, "").match(/\/([\w|\-|\/]+)\.yml/)[1];
    if(pillKey){
      let pill;
      try {
        pill = YAML.safeLoad(loadPillYaml(pillsDirectory, pillKey));
      } catch (err) {
        return;
      }
      if(!pill){ return; }
      cutPill(pill);
      pills[pillKey] = pill;
    }
  });

  return pills;

}

