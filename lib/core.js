/*global global, spade, define */

require("./base");
require("./bench");

define(function() {//global scope

  var Q = this.Q;
  
  // =================
  // = Private Fields =
  // =================
  
  var _undefined;

  var slice = Array.prototype.slice;
  
  var Bench = Q.Bench;

  Q.emptyFn =  function emptyFn() {};

  /**
   * Base mixin function
   * @private
   * @param {Boolean} override Indicate whether it should override any properies on target object
   * @param {Object} base The base object to be mixed in
   * @param {Object} mixins The mixins to be applied
   */
  function _mixin(override) {
    var target, copy, args, i, len, key, item;

    Bench.start("mixin");

    args = slice.call(arguments, 1);
    target = args[0];

    for (i = 1, len = args.length; i < len; i++) {
      if (! (item = args[i])) continue;
      for (key in item) {
        if (!item.hasOwnProperty(key)) continue;
        copy = item[key];
        if (target === copy) continue;

        if (copy !== _undefined && (override || target[key] === _undefined)) {
          target[key] = copy;
        }
      }
    }
    
    Bench.end("mixin");
    return target;
  }
  
  /**
   * Apply some functions and properties onto given object; Existing ones will not be overriden
   * @param {Object} to The target object
   * @param {Object} from One or more objects to copy from
   * @returns The merged object
   * @type Object
   */
  function supplement() {
    var args = slice.call(arguments);
    args.unshift(false);
    return _mixin.apply(this, args);
  }
  Q.supplement = supplement;

  /**
   * Apply some functions and properties on given object
   * @param {Object} to The target object
   * @param {Object} from One or more objects to copy from
   * @returns The merged object
   * @type Object
   */
  function mixin() {
    var args = slice.call(arguments);
    args.unshift(true);
    return _mixin.apply(this, args);
  }
  Q.mixin = mixin;
  
  function merge(base, copy) {
    return mixin(mixin({}, base), copy);
  }
  Q.merge = merge;
  
  /**
   * Return a new object that treat the given object as its prototype. Similar to Object.create
   * @param {Object} obj The object to be used as prototype
   * @returns The newly configured object
   * @type Object
   */
  Q.beget = function(obj) {
    if(obj === null || obj === undefined) {
      return null;
    }
    var ret = Object.create(obj);
    if(typeof obj.didBeget === "function") {
      ret = obj.didBeget(ret);
    }
    return ret;
  };
  
  Q.guid = function(seed) {
    var id = seed || 0;
    return function() {
      return id++;
    };
  }();
  

  Q.typeOf = function(obj) {
    var type = typeof obj,
    ctor;
    if (type == "undefined") {
      return type;
    }

    ctor = obj.constructor;
    if (type == "object") {
      return ctor == RegExp ? "regex": obj instanceof Array ? "array": (type.name ? type.name: "object");
    }

    //if(type == "string" || type == "boolean" || type == "undefined" || type == "number") {
    return type;
    //}
  };
  
  Q.none = function() {
    var args, i, v;
    
    args = slice.call(arguments, 0);
    i = args.length;
    while(i--) {
      v = args[i];
      if(v===undefined || v===null) {
        return true;
      }
    }
    return false;
  };  
  
});