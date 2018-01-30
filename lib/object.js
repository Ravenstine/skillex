'use strict';

const getProp   = require('keypather/get');
const setProp   = require('keypather/set');

class SkillexObject {
  constructor(object){
    this.object = object;
  }
  get(path, _default){
    return getProp(this.object, path) || _default;
  }
  set(path, value){
    return setProp(this.object, path, value);
  }
}

SkillexObject.from = function(obj){ return new SkillexObject(obj); };

module.exports = SkillexObject;