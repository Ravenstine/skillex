'use strict';

// Makes slot values a little easier to deal with.
// By default, it assumes that you'll want the most
// specific value possible, which is whatever is
// 'resolved' to a predefined slot value.  If nothing
// is resolved, it defaults to the 'literal' value.

module.exports = class {
  constructor(slot){
    this.slot = slot;
    this.slot.resolutions = this.slot.resolutions || {};
    this.slot.resolutions.resolutionsPerAuthority = this.slot.resolutions.resolutionsPerAuthority || [];
  }
  toString(){
    // Default to the strictest possible value.
    // So first, we pick off the top of what was
    // resolved.  Failing that, we fall back on
    // the spoken value that was returned to us.
    return this.strict || this.literal;
  }
  isEqualTo(b){
    return this.toString() === b;
  }
  get strict(){
    return this.slot.resolutions.resolutionsPerAuthority.map((r) => {
      if(r.status.code === 'ER_SUCCESS_MATCH'){
        return r.values[0].value.name;
      } else {
        return '';
      }
    })[0];
  }
  get literal(){
    return this.slot.value || '';
  }
}

