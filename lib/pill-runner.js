'use strict';

const labelRunner = require('./label-runner');

module.exports = (pill, request, response) => {

  let labelNames = Object.keys(pill);

  let state      = request.session.attributes['STATE'];
  // ☝ We use this session attribute to hold our 
  
  // If we have a state, parse the label name from it.
  let labelName  = state ? state.split('/').pop() : labelNames[0];

  let label      = pill[labelName];

  labelRunner(label, request, response);

  return response;

}

