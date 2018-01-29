'use strict';

const assert    = require('chai').assert;
const compileModel = require('../lib/model-compiler');

describe('model-compiler', function(){

  it('handles multi-language invocation names', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          invocationName: {
            'en-US': 'test skill',
            'de-DE': 'testfähigkeit'
          }
        }
      }
    });
    assert.equal(models['en-US'].interactionModel.languageModel.invocationName, 'test skill');
    assert.equal(models['de-DE'].interactionModel.languageModel.invocationName, 'testfähigkeit');
  });

  it('handles single string invocation name with en-US as default', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          invocationName: 'test skill'
        }
      }
    });
    assert.equal(models['en-US'].interactionModel.languageModel.invocationName, 'test skill');
  });

  it('handles multi-language samples', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          intents: [
            {
              name: 'SomeIntentName',
              samples: {
                'en-US': ['hello world'],
                'de-DE': ['hallo welt']
              },
              slots: {
                'en-US': [
                  {
                    name: 'someSlotName',
                    type: 'AMAZON.LITERAL'
                  }
                ],
                'de-DE': [
                  {
                    name: 'steckplatzname',
                    type: 'AMAZON.LITERAL'
                  }
                ]
              }
            }
          ]
        }
      }
    });
    assert.include(models['en-US'].interactionModel.languageModel.intents[0].samples, 'hello world');
    assert.include(models['de-DE'].interactionModel.languageModel.intents[0].samples, 'hallo welt');
  });

  it('handles language-non-specific samples as en-US', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          intents: [
            {
              name: 'SomeIntentName',
              samples: ['hello world']
            }
          ]
        }
      }
    });
    assert.include(models['en-US'].interactionModel.languageModel.intents[0].samples, 'hello world');
  });

  it('handles multi-language slots', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          intents: [
            {
              name: 'SomeIntentName',
              slots: {
                'en-US': [
                  {
                    name: 'someSlotName',
                    type: 'AMAZON.LITERAL'
                  }
                ],
                'de-DE': [
                  {
                    name: 'steckplatzname',
                    type: 'AMAZON.LITERAL'
                  }
                ]
              }
            }
          ]
        }
      }
    });
    assert.equal(models['en-US'].interactionModel.languageModel.intents[0].slots[0].name, 'someSlotName');
    assert.equal(models['de-DE'].interactionModel.languageModel.intents[0].slots[0].name, 'steckplatzname');
  });

  it('expands sample utterances', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          intents: [
            {
              name: 'SomeIntentName',
              samples: ['(hello|goodbye) world']
            }
          ]
        }
      }
    });
    assert.include(models['en-US'].interactionModel.languageModel.intents[0].samples, 'hello world');
    assert.include(models['en-US'].interactionModel.languageModel.intents[0].samples, 'goodbye world');
  });

  it('guesses unspecified slot types', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          intents: [
            {
              name: 'FavoriteAnimalIntent',
              samples: ['the {animal}', '{something}']
            }
          ]
        }
      }
    });
    assert.include(models['en-US'].interactionModel.languageModel.intents[0].slots[0].type, 'AMAZON.Animal');
    assert.include(models['en-US'].interactionModel.languageModel.intents[0].slots[1].type, 'AMAZON.LITERAL');
  });

  it('inserts required intents if they aren\'t specified', () => {
    let models = compileModel({
      interactionModel: {
        languageModel: {
          intents: [

          ]
        }
      }
    });
    let addedIntentNames = models['en-US'].interactionModel.languageModel.intents.map(i => i.name);
    assert.include(addedIntentNames, 'AMAZON.StopIntent');
    assert.include(addedIntentNames, 'AMAZON.CancelIntent');
    assert.include(addedIntentNames, 'AMAZON.HelpIntent');
  });

});

