'use strict';

module.exports = (scene) => {
  Object.keys(scene).forEach(labelName => {
    if(labelName.match(/^\./)) return delete scene[labelName]; // remove template labels
    let label = scene[labelName];
    Object.keys(label.intents || {}).forEach(intentName => {
      let intent      = label.intents[intentName];
      let intentNames = intentName.split(/,\s*/);
      // separate comma-delineated intents
      if(intentNames.length > 1){
        intentNames.forEach(name => {
          label.intents[name] = intent;
        });
        delete label.intents[intentName];
      }
    });
  });
  return scene;
}

