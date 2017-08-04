'use strict';

// This opens every pill, finds all the intent information, and merges it all
// into an intent-schema JSON that you can paste into the code editor
// inside the Alexa Skills Kit.


const pillBox = require('./lib/pill-box')('./pills');

// Each of the three AMAZON intents below are required.
let intents   = {
  "AMAZON.CancelIntent": {
    "name": "AMAZON.CancelIntent",
    "samples": []
  },
  "AMAZON.HelpIntent": {
    "name": "AMAZON.HelpIntent",
    "samples": []
  },
  "AMAZON.StopIntent": {
    "name": "AMAZON.StopIntent",
    "samples": []
  }
};

let types     = {};

function openPill(pill) {
  Object.keys(pill).forEach((labelName) => {
    let label = pill[labelName];
    openLabel(label);
  });
}

function openLabel(label){
  let currentIntents = (label.choice || {}).intents || {};
  Object.keys(currentIntents).forEach((intentName) => {
    intents[intentName] = intents[intentName] || {
      name: intentName,
      samples: [],
      slots: {}
    };

    let currentIntent = currentIntents[intentName];

    let mergedIntent  = intents[intentName];

    mergedIntent.samples = mergedIntent.samples.concat(currentIntent.samples || []);
    mergedIntent.samples = Array.from(new Set(mergedIntent.samples));
    mergedIntent.samples.map(sample => sample.replace(/\${/g, '{'));

    // Object.assign(mergedIntent.slots, currentIntent.slots);

    mergeSlots(mergedIntent.slots, currentIntent.slots);

  });
}

function mergeSlots(a, b){
  if(!a || !b){ return; }
  Object.keys(b).forEach((slotName) => {
    let aSlot = a[slotName];
    let bSlot = b[slotName];
    if(!aSlot){
      a[slotName] = Object.assign({}, bSlot);
    } else if(!aSlot.type || (aSlot.type.match(/AMAZON\./) && (!bSlot.type || '').match(/AMAZON\./))) {
      // only re-assign the slot type on the merged
      // slot if there is no type defined to begin
      // with, or if the new assignment is a custom
      // slot type.  not sure why i made that decision
      // but that's how it works right now so there.
      aSlot.type = bSlot.type;
    }
  })
}

Object.keys(pillBox).forEach((key) => {
  let pill = pillBox[key];
  openPill(pill);
})

let schema = {};

let json = JSON.stringify({
  intents: Object.keys(intents).map((name) => {
    let intent   = intents[name];
    intent.slots = Object.keys(intent.slots || {}).map((slotName) => { 
      return { name: slotName, type: intent.slots[slotName].type, samples: [] }; 
    });
    return intent;
  }),
  // types: {},
  // dialog: {
  //   version: "1.0",
  //   intents: {}
  // }
}, null, 2);

console.log(json)
