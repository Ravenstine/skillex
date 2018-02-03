'use strict';

// Provides a consistent internal API for navigating between
// scenes, as well as for determining if the current scene
// should be deferred because we're waiting for user input.
//
// Whenver navigation occurs, we log it so that builders and
// other parts of the code can know if navigation had occurred
// prior to the current evaluation.


module.exports = class Navigator {
  constructor(scenes, context){
    this.scenes      = scenes;
    this.context     = context;
    this.dirty       = {};
    this.isLocked    = false;
    this.shouldRepeat = false;
  }
  /**
   * Returns the current scene object if there is one. (there should be)
   * @public
   * @returns {object}
   */
  get currentScene(){
    return this.scenes[this.currentSceneName];
  }
  /**
   * Returns the current label object.
   * @public
   * @returns {object}
   */
  get currentLabel(){
    return (this.currentScene || {})[this.context.get('navigator.currentLabelName')];
  }
  /**
   * Indicates if navigation has occurred.
   * @public
   * @returns {boolean}
   */
  get hasNavigated(){
    return this.hasChanged('LABEL') || this.hasChanged('SCENE') || this.shouldRepeat;
  }
  /**
   * Indicates if the skill is waiting for another request from the user
   * @public
   * @returns {boolean}
   */
  get isWaiting(){
    return this.get('WAITING') ? true : false;
  }
  /**
   * If the skill was waiting for another request from the user(e.g. when using ask)
   * this will indicate if the current request is the one we were waiting for
   * @public
   * @returns {boolean}
   */
  get hasFinishedWaiting(){
    return this.isWaiting && !this.hasNavigated;
  }
  /**
   * If the skill was waiting for another request from the user(e.g. when using ask)
   * this will indicate if the current request is the one we were waiting for
   * @public
   * @returns {boolean}
   */
  get currentLabelName(){
    return this.context.get('sessionAttributes.LABEL');
  }
  get currentSceneName(){
    return this.context.get('sessionAttributes.SCENE');
  }
  get willNavigate(){
    // aka "will probably navigate"
    let label = this.currentLabel;
    return label.hasOwnProperty('go to') || label.hasOwnProperty('go to scene');
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
   * Navigates to a random label name in the provided list.
   * @public
   * @param {array} labelNames A list of label names
   */
  goToRandom(labelNames){
    let labelName = labelNames[Math.floor(Math.random()*labelNames.length)];
    return this.goTo(labelName);
  }
  /**
   * Sets the name of a scene to use on the next cycle.
   * @public
   * @param {string} sceneName The name of a scene.
   */
  goToScene(sceneName){
    if(this.isLocked) return;
    this.set('SCENE', sceneName);
    this.set('LABEL', null);
  }
  /**
   * Navigates to a random scene in the provided list.
   * @public
   * @param {array} sceneNames A list of scene names
   */
  goToRandom(sceneNames){
    let sceneName = sceneNames[Math.floor(Math.random()*sceneNames.length)];
    return this.goToScene(sceneName);
  }
  /**
   * Erases navigation.  Useful if there's a top level condition that an intent can override.
   * @public
   */
  finish(){
    if(this.isLocked) return;
    this.set('SCENE', null);
    this.set('LABEL', null);
  }
  repeat(repeatFrom){
    this.repeatFrom   = repeatFrom || true;
    this.shouldRepeat = true;
  }
  navigate(obj){
    if(!obj) return;
    // takes any object that has navigable properties
    if(obj.hasOwnProperty('repeat')) return this.repeat(obj['repeat']);
    if(obj.hasOwnProperty('go to')) this.goTo(obj['go to']);
    if(obj.hasOwnProperty('go to random')) this.goTo(obj['go to random']);
    if(obj.hasOwnProperty('go to scene')) this.goToScene(obj['go to scene']);
    if(obj.hasOwnProperty('go to random scene')) this.goToRandomScene(obj['go to random scene']);
    if(obj.hasOwnProperty('finish')) this.finish();
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
  continue(){
    this.repeatFrom   = null;
    this.shouldRepeat = false;
  }
  stopWaiting(){
    return this.set('WAITING', false);
    this.context.set('responseBody.shouldEndSession', true); // :notsure:
  }
  reload(){
    this.dirty = {};
    this.set('WAITING', false);
    this.shouldRepeat = false;
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

