'use strict';

const xml2js      = require('xml2js').parseString;

module.exports = (xml) => {
  let output;
  xml2js(xml, function (err, result) {
    if(err){
      throw new Error(err);
    }
    output = result;
  });
  return output;
}

