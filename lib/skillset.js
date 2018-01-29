'use strict';

// The "state box" is simply the object of states that is used
// by the application.  All we really do here is traverse the
// directory of states and process them.  It is used for both
// runtime and compilation.

const fs                = require('fs');
const YAML              = require('js-yaml');
const glob              = require('glob-fs')({ gitignore: true });

function loadStateYaml(statesDirectory, stateName){
  let yaml     = fs.readFileSync(`${statesDirectory}/${stateName}.yml`, 'utf8');
  let segments = yaml.split(/[\-]{3,}/); // a set of 3 or more dashes denotes a section
  let metadata, imports;
  let state     = [];
  if(segments.length > 1){
    metadata   = YAML.safeLoad(segments[0]) || {}; // parse metadata section
    yaml       = segments[1];
    if(typeof metadata.import === 'string'){
      imports = [metadata.import];
    } else {
      imports = metadata.import || [];
    }
    // If other states are listed under import: in the metadata section,
    // load them and prepend to the current state YAML text in order.
    imports.forEach(stateName => state.push(loadStateYaml(statesDirectory, stateName)));
  }
  state.push(yaml);
  return state.join('\r\n');
}

module.exports = (statesDirectory) => {

  let states = {};

  glob.readdirSync(`${statesDirectory}/**/*.yml`).forEach((f) => {
    // match the name of the state from the file name
    let stateKey = f.replace(statesDirectory, "").match(/\/([\w|\-|\/]+)\.yml/)[1];
    if(stateKey){
      let state;
      try {
        state = YAML.safeLoad(loadStateYaml(statesDirectory, stateKey));
      } catch (err) {
        return;
      }
      if(!state) return;
      Object.keys(state).forEach(labelName => {
        if(labelName.match(/^\./)) return delete state[labelName]; // ignore template labels
      });
      states[stateKey] = state;
    }
  });

  return states;

}

