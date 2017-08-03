'use strict';

// This opens every pill, finds all the intent information, and merges it all
// into an intent-schema JSON that you can paste into the code editor
// inside the Alexa Skills Kit.

const pillBox = require('./lib/pills-loader')('./pills');

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

    Object.assign(mergedIntent.slots, currentIntent.slots);

  });
}

Object.keys(pillBox).forEach((key) => {
  let pill = pillBox[key];
  openPill(pill);
})

let json = JSON.stringify({
  intents: Object.keys(intents).map((name) => {
    let intent   = intents[name];
    intent.slots = []; // actually convert slots later, right now this is just to make things work
    return intent;
  }),
  // types: {},
  // dialog: {
  //   version: "1.0",
  //   intents: {}
  // }
}, null, 2);

console.log(json)
