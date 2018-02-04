'use strict';

// Once a scene YAML file has been loaded and deserialized,
// this handles postprocessing of the scene object.

module.exports = (scene) => {
  Object.keys(scene).forEach(labelName => {
    if(labelName.match(/^\./)) return delete scene[labelName]; // remove template labels
    let label = scene[labelName];
    Object.keys(label.actions || {}).forEach(actionName => {
      let action      = label.actions[actionName];
      let actionNames = actionName.split(/,\s*/);
      // separate comma-delineated actions
      if(actionNames.length > 1){
        actionNames.forEach(name => {
          label.actions[name] = action;
        });
        delete label.actions[actionName];
      }
    });
  });
  return scene;
}

