'use strict';

module.exports = class {
  constructor(json) {
    Object.assign(this, json);
  }
  get(queryString) {
    let path          = queryString.split('.');
    let currentObject = this.json;
    path.forEach((getter) => {
      if(currentObject && currentObject[getter]){
        currentObject = currentObject[getter]
      }
    });
    if(currentObject === this.json){
      return '';
    } else {
      return currentObject;
    }
  }
}