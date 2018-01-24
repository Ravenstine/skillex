'use strict';

module.exports = (restoreType, context) => {
  if(context.get('session.SAVED_SESSION')){
    if(restoreType === 'session'){
      context.sessionAttributes.PILL  = context.session.SAVED_SESSION.PILL  || context.sessionAttributes.PILL;
      context.sessionAttributes.LABEL = context.session.SAVED_SESSION.LABEL || context.sessionAttributes.LABEL;
      Object.assign(context.attributes, context.session.SAVED_SESSION.ATTRIBUTES);
      delete context.session.SAVED_SESSION;
    } else if (restoreType === 'attributes') {
      Object.assign(context.attributes, context.session.SAVED_SESSION.ATTRIBUTES);
      delete context.session.SAVED_SESSION;
    }
  }
}

