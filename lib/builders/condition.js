'use strict';

module.exports = (obj, context, scriptValue) => {

  if(scriptValue){
    context.navigator.navigate(obj['if true']);
    // respond(obj['if true'], context);
  } else {
    context.navigator.navigate(obj['if false']);
    // respond(obj['if false'], context);
  }

}

