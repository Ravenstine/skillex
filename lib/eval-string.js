'use strict';

const Entities      = require('html-entities').AllHtmlEntities;
const entities      = new Entities();
const Handlebars    = require('handlebars');
const MomentHandler = require('handlebars.moment');
const correctSSML   = require('ssml-validator').correct;
const HandlebarsHelpers = require('handlebars-helpers')({
  handlebars: Handlebars
});

MomentHandler.registerHelpers(Handlebars);

Handlebars.registerHelper('uri', function(value) {
  return encodeURIComponent(value);
});

module.exports = (string, context, options) => {
  if(!string) return '';

  let rendered  = Handlebars.compile(string)(context.coalesce());
  // we're going to assume that encoded entities 
  // are of no value in an alexa skill.
  //
  // this is the best place to decode because
  // variables besides the web response may
  // also contain entities.
  let decoded   = entities.decode(rendered);

  let corrected = correctSSML(decoded);

  return corrected;
}

