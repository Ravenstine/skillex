'use strict';

const fs                = require('fs');
const YAML              = require('js-yaml');
const pascal            = require('pascal-case');
const glob              = require('glob-fs')({ gitignore: true });
const expandUtterance   = require('./expand-utterance');

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

function formatIntentName(utterance){
// This allows us to write intent names in our pills
// w/o having to use PascalCase.  Because intent names
// can't share names with slots, the suffix "Intent" is
// automatically appended to the end of pascalized intent
// names if they aren't already there to reduce the
// possibility of there being a naming issue.
// So theoretically, you can name your intents can share
// names with their slots inside pills.  I don't know why
// you would want to do that, however.

  let pascalName = pascal(utterance).replace(/Intent$/) +  'Intent';
  
  if(AMAZON_ALIASES.indexOf(utterance.trim()) > -1){
    pascalName = `AMAZON.${pascalName}`;
  }

  return pascalName;
}


function processLabel(label) {
  if(!label.utterances){ return;}

  label.intents = {};

  Object.keys(label.utterances).forEach((utterance) => {
    if(!utterance || utterance.trim() === '?') {
      // ignore wildcard intent fields
      label.intents[utterance] = label.utterances[utterance];
      return;
    }
    if (utterance.match(/^AMAZON\./)){ return; }
    // ☝ we skip amazon's built-in intents if they are
    // already formatted properly
    
    let utteranceConfig = label.utterances[utterance];

    let intent          = Object.assign({}, utteranceConfig);

    expandUtterance(utterance, intent);

    // replace the utterance with a properly
    // formatted intent name
    // delete intents[utterance];
    label.intents[formatIntentName(utterance)] = intent;
  });
  // we've transformed utterances into
  // intents so we don't need these anymore
  delete label.utterances;
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

