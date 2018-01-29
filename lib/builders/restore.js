'use strict';

module.exports = (restoreType, context) => {
  if(context.get('session.SAVED_STATE')){
    if(restoreType === 'session'){
      context.sessionAttributes.STATE  = context.session.SAVED_SESSION.STATE  || context.sessionAttributes.STATE;
      context.sessionAttributes.LABEL = context.session.SAVED_SESSION.LABEL || context.sessionAttributes.LABEL;
      Object.assign(context.attributes, context.session.SAVED_SESSION.ATTRIBUTES);
      delete context.session.SAVED_SESSION;
    } else if (restoreType === 'attributes') {
      Object.assign(context.attributes, context.session.SAVED_SESSION.ATTRIBUTES);
      delete context.session.SAVED_SESSION;
    }
    return true;
  }
  return false;
}

