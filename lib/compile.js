'use strict';

// This opens every state, finds all the intent information, and merges it all
// into an intent-schema JSON that you can paste into the code editor
// inside the Alexa Skills Kit.

const utteranceExpander = require('intent-utterance-expander');

module.exports  = (stateBox) => {

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

  function extractIntents(currentIntents){
    // expects an intents object, usually from a choice.
    //
    // goes through each intent, does some processing,
    // and merges into the main intents object
    Object.keys(currentIntents).forEach((intentName) => {
      if(!intentName || intentName.trim() === '?') {
        // ignore wildcard intent fields
        return;
      }

      intents[intentName] = intents[intentName] || {
        name: intentName,
        samples: [],
        slots: {}
      };

      let currentIntent   = currentIntents[intentName];

      let mergedIntent    = intents[intentName];

      let currentSamples  = currentIntent.samples || [];

      // expand out the sample utterances
      let expandedSamples = utteranceExpander(currentSamples);
      // merge the expaned samples into the merged intent samples
      mergedIntent.samples = mergedIntent.samples.concat.apply([], expandedSamples);
      // uniq the samples array
      mergedIntent.samples = Array.from(new Set(mergedIntent.samples));
      // remove our own template string format (might not need to do this anymore)
      mergedIntent.samples = mergedIntent.samples.map(sample => sample.replace(/\${/g, '{'));

      mergeSlots(mergedIntent.slots, currentIntent.slots);

      // merge type data for this particular intent.
      // note that this has nothing to do with the
      // final compilation of types.
      // mergeTypes(mergedIntent.slots);

    });
  }

  function mergeSlots(a, b){
    if(!a || !b){ return; }
    // go through each slot from the current
    // intent object(which is b) and try to
    // merge it into the intent of the corresponding
    // name in the main intents object
    Object.keys(b).forEach((slotName) => {
      let aSlot = a[slotName];
      let bSlot = b[slotName];
      if(!aSlot){
        // if the merged intent slot doesn't exist,
        // just assign a clone of the current slot
        a[slotName] = Object.assign({}, bSlot);
      } else if(!aSlot.type || (aSlot.type || '').match(/^AMAZON\./) && !(bSlot.type || '').match(/^AMAZON\./)) {
        // only re-assign the slot type on the merged
        // slot if there is no type defined to begin
        // with, or if the new assignment is a custom
        // slot type.  not sure why i made that decision
        // but that's how it works right now so there.
        aSlot.type = bSlot.type;
        if(aSlot.type){
          aSlot.values = (aSlot.values || []).concat(bSlot.values || []);
        }
      } else {
        aSlot.values = (aSlot.values || []).concat(bSlot.values || []);
      }
    });
  }

  // function mergeTypes(slots){
  //   // debugger
  // }

  // open each state,
  // find & merge all intents into a main intents object,
  // 
  Object.keys(stateBox).forEach(key => {
    let state = stateBox[key];
    // go through each label of the state
    Object.keys(state).forEach(labelName => {
      let label = state[labelName];
      extractIntents(label.intents || {});
    });
  })

  // go through each intent and
  // extract slot type information
  Object.keys(intents).forEach(intentName => {
    let intent = intents[intentName];
    Object.keys(intent.slots || []).forEach(slotName => {
      let slot = intent.slots[slotName];
      if(slot.type){
        // create a key in global types object so we
        // can merge unique types
        types[slot.type] = types[slot.type] || {};
        let type = types[slot.type];
        type.values = (type.values || []).concat(slot.values || []);
        type.values = Array.from(new Set(type.values)); // uniq the values
        type.values = type.values.map(v => {
          // transform string values
          // into proper slot value objects
          if(typeof v === 'string'){
            return {
              id: null,
              name: {
                value: v,
                synonyms: []
              }
            };
          } else {
            return {
              id: null,
              name: {
                value: v.value,
                synonyms: v.synonyms || []
              }
            };
          }
        });
      }
    });
  });

  // construct final schema

  return {
    languageModel: {
      intents: Object.keys(intents).map(name => {
        if(!name.match(/Intent$/)) return;
        // if the intent is actually a 'virtual' request(e.g. LaunchRequest)
        // then don't include it when compiling
        let intent   = Object.assign({}, intents[name]);
        intent.slots = Object.keys(intent.slots || {}).map(slotName => { 
          return { name: slotName, type: intent.slots[slotName].type, samples: [] }; 
        });
        return intent;
      }).filter(a => a),
      types: Object.keys(types).map(name => {
        // go through each of our compiled intents,
        // look through the slots, and extract/merge
        // the types that are specified
        if(name.match(/^AMAZON\./)) return;
        let type = types[name];
        return {
          name: name,
          values: (type.values || [])
        };
      }).filter(a => a),
      // dialog: {
      //   version: "1.0",
      //   ask: {}
      // }
    }
  };

}

