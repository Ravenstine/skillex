'use strict';

const fs       = require('fs');
const YAML     = require('js-yaml');
const pascal   = require('pascal-case');
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

function formatIntentNames(pill) {
  // This allows us to write intent names in our pills
  // w/o having to use PascalCase.  Because intent names
  // can't share names with slots, the suffix "Intent" is
  // automatically appended to the end of pascalized intent
  // names if they aren't already there to reduce the
  // possibility of there being a naming issue.
  // So theoretically, you can name your intents can share
  // names with their slots inside pills.  I don't know why
  // you would want to do that, however.
  Object.keys(pill).forEach((labelName) => {
    let label = pill[labelName];
    if(label.choice && label.choice.intents){
      Object.keys(label.choice.intents).forEach((intentName) => {
        if (intentName.match(/^AMAZON\./)){ return; }
        // ☝ we skip amazon's built-in intents because they should already
        // be properly formatted and they're the only ones that are permitted
        // to have a period namespace.
        let intent           = label.choice.intents[intentName];
        let pascalName       = pascal(intentName).match(/Intent$/) ? pascal(intentName) : (pascal(intentName) + 'Intent');
        delete label.choice.intents[intentName];
        label.choice.intents[pascalName] = intent;
      });
    }
  })
}

module.exports = (pillsDirectory) => {

  let pills = {};

  glob.readdirSync(`${pillsDirectory}/**/*.yml`).forEach((f) => {
    // match the name of the pill from the file name
    let pillKey = f.replace(pillsDirectory, "").match(/\/([\w|\-|\/]+)\.yml/)[1];
    if(pillKey){
      let pill = YAML.safeLoad(loadPillYaml(pillsDirectory, pillKey));
      formatIntentNames(pill);
      pills[pillKey] = pill;
    }
  });

  return pills;

}

