'use strict';

// The "scene box" is simply the object of scenes that is used
// by the application.  All we really do here is traverse the
// directory of scenes and process them.  It is used for both
// runtime and compilation.

const parseScene = require('./scene-parser');
const fs         = require('fs');
const glob       = require('glob-fs')({ gitignore: true });
const YAML       = require('js-yaml');

module.exports = (scenesDirectory) => {

  let scenes = {};
  glob.readdirSync(`${scenesDirectory}/**/*.yml`).forEach((f) => {
    // match the name of the scene from the file name
    let sceneKey = f.replace(scenesDirectory, "").match(/\/([\w|\-|\/]+)\.yml/)[1];
    if(sceneKey){
      let scene;
      try {
        scene = YAML.safeLoad(fs.readFileSync(`${scenesDirectory}/${sceneKey}.yml`, 'utf8'));
      } catch (err) {
        console.log(err);
        return;
      }
      if(!scene) return;
      scenes[sceneKey] = parseScene(scene);
    }
  });
  return scenes;

}

