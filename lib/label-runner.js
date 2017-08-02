'use strict';

module.exports = (label, request, response) => {
  // Append dialog text to repsonse output speech text.
  response.response.outputSpeech.text += (label.dialog || '');
}

