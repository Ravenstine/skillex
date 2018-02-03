'use strict';

const getProp           = require('keypather/get');
const utteranceExpander = require('intent-utterance-expander');
const aliases           = require('../built-in-slot-type-aliases');

const requiredIntents = ['AMAZON.CancelIntent', 'AMAZON.HelpIntent', 'AMAZON.StopIntent'];

function expandUtterances(input){
  let utterances = [].concat(input);
  let expanded   = utteranceExpander(utterances);
  if(!expanded.length) return expanded;
  return expanded.reduce((a, b) => a.concat(b)).map(u => u.trim().replace(/\s+/g, ' '));
}

module.exports = (schema) => {

  function get(path, _default) {
    return getProp(schema, path) || _default;
  }

  const models = {};

  // crawl the interaction model to get all possible locales
  let objs = [get('interactionModel.languageModel.invocationName')]
  .concat(get('interactionModel.languageModel.intents', []).map(i => i.samples))
  .concat(get('interactionModel.languageModel.intents', []).map(i => i.slots))
  .concat(get('prompts', []).map(p => p.variations))
  .filter(obj => (typeof obj === 'object') && !Array.isArray(obj));
  if(!objs.length) objs.push({'en-US': {}});
  objs.forEach(obj => {
    Object.keys(obj).forEach(locale => models[locale] = models[locale] || {
      interactionModel: {
        languageModel: {
          invocationName: '',
          intents: [],
          types: []
        },
        dialog: {},
        prompts: []
      }
    });
  });

  // if(!Object.keys(models).length) models['en-US'] = {};

  Object.keys(models).forEach(locale => {
    let interactionModel = models[locale].interactionModel;
    // invocation name
    if(typeof get('interactionModel.languageModel.invocationName') == 'object'){
      interactionModel.languageModel.invocationName = get('interactionModel.languageModel.invocationName')[locale];
    } else if(typeof get('interactionModel.languageModel.invocationName') == 'string') {
      interactionModel.languageModel.invocationName = get('interactionModel.languageModel.invocationName');
    }

    // intents
    interactionModel.languageModel.intents = get('interactionModel.languageModel.intents', []).map(intent => {
      let output = {
        name: intent.name
      };
      if(Array.isArray(intent.slots)) { 
        output.slots   = intent.slots;
      } else if(typeof intent.slots === 'object') {
        output.slots   = intent.slots[locale];
      } else {
        output.slots   = [];
      }
      let samples = [];
      if(Array.isArray(intent.samples)) {
        samples = intent.samples;
      } else if (typeof intent.samples === 'string'){
        samples = [intent.samples];
      } else if(typeof intent.samples === 'object') {
        samples = intent.samples[locale];
      }
      output.samples = expandUtterances(samples);
      let slots = output.slots;
      output.samples.forEach(sample => {
        // guess slot names and types if they aren't specified
        (sample.match(/\{\s*([A-z]+)\s*\}/g) || [])
          .map(s => s.replace(/[{|}]/g, ''))
          .forEach(slotName => {
            let slot = slots.filter(s => s.name == slotName)[0];
            if(!slot){
              slots.push({
                name: slotName
              });
              slot = slots.filter(s => s.name == slotName)[0];
              // only guess the type if no explicit slot definition
              if(!slot.type){
                slot.type = aliases[slotName] || 'AMAZON.LITERAL';
              }
            }
          });
      });
      return output;
    });

    // add required intents if they aren't specified
    requiredIntents.forEach(requiredIntentName => {
      if(interactionModel.languageModel.intents.map(i => i.name).indexOf(requiredIntentName) < 0){
        interactionModel.languageModel.intents.push({
          name: requiredIntentName,
          samples: [],
          slots: []
        });
      }
    });

    // types
    interactionModel.languageModel.types = (get('interactionModel.languageModel.types', {})[locale] || 
      get('interactionModel.languageModel.types') || 
    []);

    // dialog
    Object.assign(interactionModel.dialog, schema.dialog);

    // prompts
    interactionModel.prompts = get('prompts', []).map(prompt => {
      let output = {id: prompt.id};
      if(Array.isArray(prompt.variations)) {
        output.variations = prompt.variations;
      } else if(typeof prompt.variations === 'object') {
        output.variations = prompt.variations[locale];
      }
      return output;
    }).filter(p => p.variations);

    // remove unused keys
    Object.keys(interactionModel).forEach(key => {
      let value = interactionModel[key];
      if( (Array.isArray(value) && !value.length) || ((typeof value === 'object') && !Object.keys(value).length) ){
        delete interactionModel[key];
      }
    });

  });

  return models;

}

