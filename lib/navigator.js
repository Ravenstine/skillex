'use strict';

// Provides a consistent internal API for navigating between
// states, as well as for determining if the current state
// should be deferred because we're waiting for user input.
//
// Whenver navigation occurs, we log it so that builders and
// other parts of the code can know if navigation had occurred
// prior to the current evaluation.

module.exports = class Navigator {
  constructor(pills, context){
    this.pills    = pills;
    this.context  = context;
    this.dirty    = {};
    this.isLocked = false;
  }
  /**
   * Returns the current pill object if there is one. (there should be)
   * @public
   * @returns {object}
   */
  get currentPill(){
    return this.pills[this.currentPillName];
  }
  /**
   * Returns the current label object.
   * @public
   * @returns {object}
   */
  get currentLabel(){
    return (this.currentPill || {})[this.context.get('navigator.currentLabelName')];
  }
  /**
   * Indicates if navigation has occurred.
   * @public
   * @returns {boolean}
   */
  get hasNavigated(){
    return this.hasChanged('LABEL') || this.hasChanged('PILL');
  }
  get isWaiting(){
    return this.get('WAITING') ? true : false;
  }
  get hasFinishedWaiting(){
    return this.isWaiting && !this.hasNavigated;
  }
  get currentLabelName(){
    return this.context.get('sessionAttributes.LABEL') || Object.keys(this.currentPill || {})[0];
  }
  get currentPillName(){
    return this.context.get('sessionAttributes.PILL');
  }
  get willNavigate(){
    // aka "will probably navigate"
    let label = this.currentLabel;
    return label.hasOwnProperty("go to") || label.hasOwnProperty("swallow pill");
  }
  hasChanged(k){
    return this.dirty.hasOwnProperty(k);
  }
  /**
   * Sets the name of a label to evaluate on the next cycle.
   * @public
   * @param {string} labelName The name of a label.
   */
  goTo(labelName){
    if(this.isLocked) return;
    this.set('LABEL', labelName);
  }
  /**
   * Sets the name of a pill to use on the next cycle.
   * @public
   * @param {string} pillName The name of a pill.
   */
  swallowPill(pillName){
    if(this.isLocked) return;
    this.set('PILL', pillName);
    this.set('LABEL', null);
  }
  navigate(obj){
    // takes any object that has navigable properties
    if(obj.hasOwnProperty('swallow pill')){
      this.swallowPill(obj['swallow pill']);
    }
    if(obj.hasOwnProperty('go to')){
      this.goTo(obj['go to']);
    }
  }
  get(k){
    return this.context.get(`sessionAttributes.${k}`);
  }
  set(k,v){
    this.dirty[k] = v;
    return this.context.set(`sessionAttributes.${k}`, v);
  }
  initialize(k,v) {
    // used to set a navigation value without actually navigating
    return this.context.set(`sessionAttributes.${k}`, v);
  }
  wait(){
    // There's a reason we're not just depending on 'shouldEndSession'.
    // First of all, someone *may* want to override shouldEndSession
    // manually.  I don't know why they would do that, but it's possible.
    // Second, on receiving user input, using the 'WAITING' attribute
    // gives us a more precise indication of whether or not we should
    // process user input or continue forward.
    this.set('WAITING', true);
    this.context.set('responseBody.shouldEndSession', false);
  }
  stopWaiting(){
    return this.set('WAITING', false);
    this.context.set('responseBody.shouldEndSession', true); // :notsure:
  }
  reload(){
    this.dirty = {};
    this.set('WAITING', false);
  }
  /**
   * Is used to prevent navigation from occuring when methods such as goTo are called.
   * @private
   */
  lock(){
    this.isLocked = true;
  }
  /**
   * Unlocks navigation.
   * @private
   */
  unlock(){
    this.isLocked = false;
  }
}

