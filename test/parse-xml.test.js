'use strict';

const assert          = require('assert');
const parseXML        = require('../lib/xml-parser');

describe('xml-parser', function(){

  let xml = `
    <?xml version="1.0"?>
    <catalog>
       <book id="1">
          <title>Hello World</title>
       </book>
    </catalog>
  `

  it('converts XML to an object', function(){
    let obj = parseXML(xml);
    assert.equal(obj.catalog.book[0].title[0], 'Hello World');
  });
  
});



