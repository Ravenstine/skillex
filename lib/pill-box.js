'use strict';

const fs                = require('fs');
const YAML              = require('js-yaml');
const pascal            = require('pascal-case');
const glob              = require('glob-fs')({ gitignore: true });
const expandMatcher     = require('./expand-matcher');

// We make an assumption that when you use one of these intent names
// that you want to use an Amazon built-in intent, so we automagically
// reformat them as such.  For instance, if you used 'pause' as an intent name,
// instead of getting translated to PauseIntent, it would get translated
// to AMAZON.PauseIntent.
const AMAZON_ALIASES = [
  'cancel',
  'help',
  'loop off',
  'loop on',
  'next',
  'no',
  'pause',
  'previous',
  'repeat',
  'resume',
  'shuffle off',
  'shuffle on',
  'start over',
  'stop',
  'yes',
  'page up',
  'page down',
  'more',
  'navigate home',
  'navigate settings',
  'scroll up',
  'scroll left',
  'scroll right',
  'scroll down'
];

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

function formatIntentName(intentName){
// This allows us to write intent names in our pills
// w/o having to use PascalCase.  Because intent names
// can't share names with slots, the suffix "Intent" is
// automatically appended to the end of pascalized intent
// names if they aren't already there to reduce the
// possibility of there being a naming issue.
// So theoretically, you can name your intents can share
// names with their slots inside pills.  I don't know why
// you would want to do that, however.
  if(!intentName || intentName.trim() === '?') {
    // ignore wildcard intent fields
    // delete intents[intentName];
    return;
  }
  if (intentName.match(/^AMAZON\./)){ return; }
  // ☝ we skip amazon's built-in intents if they are
  // already formatted properly

  let pascalName       = pascal(intentName);

  if(pascalName.match(/Request$/)){
    // Because not every actual request type is suffixed
    // with 'Request', we need to just remove it.
    pascalName = pascalName.replace(/Request$/, '');
  } else {
    // Because we want to treat request types the same as
    // intents, we will only add the 'Intent' suffix if 
    // the specified intent is indeed an intent.
    pascalName = pascalName.replace(/Intent$/) +  'Intent';
  }

  if(AMAZON_ALIASES.indexOf(intentName.trim()) > -1){
    pascalName = `AMAZON.${pascalName}`;
  }

  return pascalName;

}

function processIntents(intents){
  Object.keys(intents).forEach((intentName) => {
    if(!intentName || intentName.trim() === '?') {
      // ignore wildcard intent fields
      // delete intents[intentName];
      return;
    }
    if (intentName.match(/^AMAZON\./)){ return; }
    // ☝ we skip amazon's built-in intents if they are
    // already formatted properly
    
    let intent = intents[intentName];
    extractIntentData(intentName, intent);
    delete intents[intentName];
    intents[formatIntentName(intentName)] = intent;
  });
}

function processLabel(label) {
  if(label.intents){
    processIntents(label.intents);
  }
  if(label.choice && label.choice.intents){
    processIntents(label.choice.intents);
  }
}

function extractIntentData(intentName, intent) {
  // So rather than defining intents explicitly,
  // we are deriving them from "matcher" strings.
  if(!intentName || intentName.trim() === '?') {
    // ignore wildcard intent fields
    // delete intents[intentName];
    return;
  }
  if (intentName.match(/^AMAZON\./)){ return; }
  // ☝ we skip amazon's built-in intents if they are
  // already formatted properly
  
  // derive sample utterances from the matcher
  expandMatcher(intentName, intent);
} 

function processPill(pill){
  Object.keys(pill).forEach((labelName) => {
    if(!labelName.match(/^\./)){
      // ignore template labels
      let label = pill[labelName];
      processLabel(label);
    }
  });
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
      processPill(pill);
      pills[pillKey] = pill;
    }
  });

  return pills;

}

