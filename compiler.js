'use strict';

// This opens every pill, finds all the intent information, and merges it all
// into an intent-schema JSON that you can paste into the code editor
// inside the Alexa Skills Kit.


const pillBox = require('./lib/pill-box')('./pills');
const utteranceExpander = require('intent-utterance-expander');

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
  },
  "AMAZON.PauseIntent": {
    "name": "AMAZON.PauseIntent",
    "samples": []
  },
  "AMAZON.ResumeIntent": {
    "name": "AMAZON.ResumeIntent",
    "samples": []
  }
};

let types     = {};

function openPill(pill) {
  // go through each label of the pill
  Object.keys(pill).forEach((labelName) => {
    let label = pill[labelName];
    openLabel(label);
  });
}

function parseIntents(currentIntents){
  // expects an intents object, usually from a choice
  Object.keys(currentIntents).forEach((intentName) => {
    intents[intentName] = intents[intentName] || {
      name: intentName,
      samples: [],
      slots: {}
    };

    let currentIntent   = currentIntents[intentName];

    let mergedIntent    = intents[intentName];

    let currentSamples  = currentIntent.samples || [];

    let expandedSamples = utteranceExpander(currentSamples)

    mergedIntent.samples = mergedIntent.samples.concat.apply([], expandedSamples);
    mergedIntent.samples = Array.from(new Set(mergedIntent.samples));
    // remove our own template string format
    mergedIntent.samples = mergedIntent.samples.map(sample => sample.replace(/\${/g, '{'));

    // Object.assign(mergedIntent.slots, currentIntent.slots);

    mergeSlots(mergedIntent.slots, currentIntent.slots);

    mergeTypes(mergedIntent.slots);

  });
}


function openLabel(label){
  // parse label intents
  parseIntents(label.intents || {});
  // parse choice intents
  parseIntents((label.choice || {}).intents || {});

}

function mergeSlots(a, b){
  if(!a || !b){ return; }
  Object.keys(b).forEach((slotName) => {
    let aSlot = a[slotName];
    let bSlot = b[slotName];
    if(!aSlot){
      a[slotName] = Object.assign({}, bSlot);
    } else if(!aSlot.type || (aSlot.type.match(/^AMAZON\./) && (!bSlot.type || '').match(/^AMAZON\./))) {
      // only re-assign the slot type on the merged
      // slot if there is no type defined to begin
      // with, or if the new assignment is a custom
      // slot type.  not sure why i made that decision
      // but that's how it works right now so there.
      aSlot.type = bSlot.type;
      if(aSlot.type){
        aSlot.values = (aSlot.values || []).concat(bSlot.values || []);
      }
    }
  })
}

function mergeTypes(){

}

Object.keys(pillBox).forEach((key) => {
  let pill = pillBox[key];
  openPill(pill);
})

// construct final schema

let schema = {};

let json = JSON.stringify({
  intents: Object.keys(intents).map((name) => {
    let intent   = Object.assign({}, intents[name]);
    intent.slots = Object.keys(intent.slots || {}).map((slotName) => { 
      return { name: slotName, type: intent.slots[slotName].type, samples: [] }; 
    });
    return intent;
  }),
  types: Object.keys(intents).map((name) => {
    let intent   = intents[name];
    return Object.keys(intent.slots || {})
      .filter(slotName => intent.slots[slotName].type) // ignore slots with no type specified
      .map((slotName) => {
        let slot   = intent.slots[slotName];
        if(slot.type){
          return { 
            name: slot.type,
            values: (slot.values || []).map((v) => {
              return {
                id: null,
                name: {
                  value: v,
                  synonyms: []
                }
              }
            })
          }
        }
      });
  }).filter(a => a.length).pop(),
  // dialog: {
  //   version: "1.0",
  //   intents: {}
  // }
}, null, 2);

console.log(json)
