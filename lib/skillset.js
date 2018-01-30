'use strict';

// The "scene box" is simply the object of scenes that is used
// by the application.  All we really do here is traverse the
// directory of scenes and process them.  It is used for both
// runtime and compilation.

const fs                = require('fs');
const YAML              = require('js-yaml');
const glob              = require('glob-fs')({ gitignore: true });

function loadSceneYaml(scenesDirectory, sceneName){
  let yaml     = fs.readFileSync(`${scenesDirectory}/${sceneName}.yml`, 'utf8');
  let segments = yaml.split(/[\-]{3,}/); // a set of 3 or more dashes denotes a section
  let metadata, imports;
  let scene     = [];
  if(segments.length > 1){
    metadata   = YAML.safeLoad(segments[0]) || {}; // parse metadata section
    yaml       = segments[1];
    if(typeof metadata.import === 'string'){
      imports = [metadata.import];
    } else {
      imports = metadata.import || [];
    }
    // If other scenes are listed under import: in the metadata section,
    // load them and prepend to the current scene YAML text in order.
    imports.forEach(sceneName => scene.push(loadSceneYaml(scenesDirectory, sceneName)));
  }
  scene.push(yaml);
  return scene.join('\r\n');
}

module.exports = (scenesDirectory) => {

  let scenes = {};

  glob.readdirSync(`${scenesDirectory}/**/*.yml`).forEach((f) => {
    // match the name of the scene from the file name
    let sceneKey = f.replace(scenesDirectory, "").match(/\/([\w|\-|\/]+)\.yml/)[1];
    if(sceneKey){
      let scene;
      try {
        scene = YAML.safeLoad(loadSceneYaml(scenesDirectory, sceneKey));
      } catch (err) {
        return;
      }
      if(!scene) return;
      Object.keys(scene).forEach(labelName => {
        if(labelName.match(/^\./)) return delete scene[labelName]; // ignore template labels
      });
      scenes[sceneKey] = scene;
    }
  });

  return scenes;

}

