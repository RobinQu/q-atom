/*global global, define */

require("./core");

define(function() {//global scope
  
  var Q = this.Q;
  
  var slice = Array.prototype.slice;

  var propertyDepsKeyOnFunction = "_property_deps_info_";

  var observerDepsKeyOnFunction = "_observer_deps_info_";
  
  var mixinInitializerKey = "initMixin";
  
  var Bench = Q.Bench;
  
  Q.mixin(Q.WARNINGS, {
    "emtpy_hash_to_extend": "[#extend] Cannot extend from empty hash!",
    "cannot_make_observer_on_property": "[Function#observes] You cannot assign an observer with a computed property!",
    "cannot_make_property_on_observer": "[Function#property] You cannot assign a computed property with an observer!",
    "illegal_arguments": "[%@] Illegal argumments!"
  });
  
  /**
   * The little trick to give overriden method a change to run its 'super' method
   * @private
   * @param {Object} parent The parent prototype object
   * @param {String} name The name of the function
   * @returns A closure that runs the 'super' method
   * @type Function
   */
  function _assign_base(parent, name) {
    var func;
    func = parent[name];
    return function() {
      return func ? func.apply(this, arguments) : Q.emptyFn;
    };
  }

  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  /**
   * Extend a base class
   * @param {Class|Object} base The parent class to be extended
   * @param {Object} ext The objects to mix in
   */
  function extend(base, ext) {  
    var key, i, len, value, proto, propertyInfo, observerInfo, initMixins;

    if(!ext) {
      console.warn(Q.WARNINGS["empty_hash_to_extend"]);
      return this;
    }

    if ((base.isClass || typeof base == "function") && (ext.isClass || typeof ext == "function")) {//this is a simple extending action
      inherits(base, ext);
      return base;
    }

    proto = base.prototype || base;//base could be an initialized object not a class
    for (key in ext) { //take care of ext, not just mixin in
      if(!ext.hasOwnProperty(key)) continue;

      value = ext[key];
      if (value && value instanceof Function) {
        if(value.isProperty) {//it's a computed property; merge deps info
          propertyInfo = proto[key] && proto[key][propertyDepsKeyOnFunction] ? proto[key][propertyDepsKeyOnFunction] : [];
          propertyInfo.concat(value[propertyDepsKeyOnFunction]);
        } else if(value.isObserver) {//it's a function observer; merge deps info
          observerInfo = proto[key] && proto[key][observerDepsKeyOnFunction] ? proto[key][observerDepsKeyOnFunction]: [];
          observerInfo.concat(value[observerDepsKeyOnFunction]);
        } else if(proto[key] && proto[key] instanceof Function) {//adding base property if we override the function
          if(key == mixinInitializerKey) {//when we have second "initMixin"
            if(Q.typeOf(proto[key]) == "array") {
              initMixins.push(value);
            } else {
              initMixins = [value];
            }
            value = initMixins;
          } else {
            value.base = _assign_base(proto, key);
          }
        }
      }    
      proto[key] = value;//copy to proto anyway
    }

    return base;
  }

  
  //TODO statics
  function _object_statics (statics) {
    var C = this;
    return Q.mixin(C, statics);
  }

  /**
   * Factory method for a class. Run this method on class to initialize an object from this class.
   * @private
   * @returns The initialized object
   * @type Object
   */
  function _object_create(props) {
    Bench.start("Atom#create");
    
    var C = this,//refer to this class
        c = new C(props);
        
    Bench.end("Atom#create");
    
    return c;
  }

  /**
   * The initializer for most objects. It will be run at 'new' keyworkd and in #create method
   * @private
   */
  function _object_init() {//"this" refers to the initialized object
    var args, i, len;
    
    Bench.start("Atom#init");
    
    //1. apply mixin
    args = slice.call(arguments, 0);
    len = args[0] ? args.length : 0;//prevent invoking with no arguments

    for(i=0;i<len;i++) {
      extend(this, args[i]);
    }
    //2. save a guid
    this.guid = "%@-%@".fmt("object", Q.guid());

    //3. save created time
    this.createdAt = new Date();
        
    
    if(!this.lazy) {
      //4. run #init
      if(this.init) this.init();
      
      //5. run #initMixin if any
      if(this.initMixin) {
        if(Q.typeOf(this.initMixin) == "array") {
          this.initMixin.invoke();
        } else {
          this.initMixin();
        }
      }
    } 
    
    Bench.end("Atom#init");

    //finaly, return
    return this;
  }

  function _object_extend() {
    var args, C, i, len;

    Bench.start("Atom#extend");
    
    C = this;
    function Ctor(props) {
      //Ctor.super_.apply(this, arguments);
      this.constructor = Ctor;
      return _object_init.call(this, props);
    }
    args = slice.call(arguments, 0);
    //1. extend from C(this)
    //args.unshift(C);
    extend(Ctor, C);
    //2. apply any object configs
    for (i = 0, len = args.length; i < len; i++) {
      extend(Ctor, args[i].prototype || args[i]);
    }
    //3. adding some basic behaviors of a "class"  
    Q.mixin(Ctor, {
      isClass: true,
      create: _object_create,
      extend: _object_extend,
      statics: _object_statics
    });

    Bench.end("Atom#extend");
    
    return Ctor;
  }
  
  /**
   * The base object class, all other object are sub-class of this class
   * @author RobinQu
   * @version 0.1
   */
  function Atom(props) {
    return _object_init.call(this, props);
  }

  Q.mixin(Atom, {
    isClass: true,
    create: _object_create,
    extend: _object_extend,
    statics: _object_statics
  });

  Atom.prototype = {//setup a clean prototype

    init: function() {
      return this;
    },

    mixin: function() {
      var args = slice.call(arguments, 0);
      args.unshift(this);
      return Q.mixin.apply(null, args);
    },

    /**
      This property, if set to true, will prevent the invocation of #init method during the initialization
     */
    lazy: false,
    
    destroyed: false,

    //TODO shallow copy
    clone: function() {},

    //TODO comparing method
    equals: function(obj) {},

    //TODO toString method
    toString: function() {
      return Object.prototype.toString.apply(this, arguments);
    },
    
    respondsTo: function(methodName) {
      return !!(this[methodName] instanceof Function);
    },
    
    tryToPerform: function(methodName, arg1, arg2) {
      return this.respondsTo(methodName) && (this[methodName](arg1, arg2) !== false);
    },
    
    destroy: function() {
      for(var key in this) {
        if(this.hasOwnProperty(key)) {
          delete this[key];
        }
      }
      this.destroyed = true;//mark the object!
    }

  };  
  
  //I give your name, thus you call me the one!
  Q.Object = Q.Atom = Atom;
  
  module.exports = {
    Atom: Atom,
    Object: Atom
  };
  
});