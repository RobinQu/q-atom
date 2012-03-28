/*global global, spade, define */

(function(g) {
  
  /**
   * Trunk method for require. We support spade, and require in NodeJs or any existing require methods
   * @param {String} moduleName The module to load
   * @returns The found module
   * @type Module|Object
   */
  g.require = typeof require == "undefined" ? function(mod) { console.log("[#require] Tried to find a module loader for " + mod); } : require;

  /**
   * Trunk for define function. It's not a AMD-style define function. This serves as a universal interface to various kinds of module loaders.
   * @param {Function} f The factory method of this class/module
   * @returns The defined class/module
   * @type Object|Module
   */
  g.define = (typeof define == "function" && define.amd)? define : function(f) {
    f.call(g);
  };
  
  /**
    * This is the origin of everthing
   */
  g.Q = typeof g.Q == "undefined" ? {
    WARNINGS: {}
  } : g.Q;
  
  /**
    * Watch out for bad guys
   */
  var _undefined;
  
  /**
   * String interpolation support, e.g: "%@ is %@".fmt("Today", "Sunday") === "Today is Sunday"
   * @returns Formated string
   * @type String
   */
  if (!String.prototype.fmt) {
    String.prototype.fmt = function() {
      // first, replace any ORDERED replacements.
      var args = arguments;
      var idx = 0; // the current index for non-numerical replacements
      return this.replace(/%@([0-9]+)?/g,
      function(s, argIndex) {
        argIndex = (argIndex) ? parseInt(argIndex, 0) - 1 : idx++;
        s = args[argIndex];

        return ((s === null) ? '(null)': (s === _undefined) ? '': s).toString();
      });
    };
  }

  /**
   * Delegate function to another object agent
   * @param {Object} agent The agent which this function will be run with
   * @returns Itself
   * @type Function
   */
  if (!Function.prototype.delegate) {
    Function.prototype.delegate = function(agent) {
      var self = this;
      return function() {
        return self.apply(agent, arguments);
      };
    };
  }

  /**
   * Enhance a function execution
   * @param {Object} original The result of original function
   */
  if(!Function.prototype.enhance) {
    Function.prototype.enhance = function(fn) {
      var self = this;
      return function() {
        var original = self.apply(this, arguments);
        return fn.apply(this, [original].concat(arguments));
      };
    };
  }
  
})(typeof window == "undefined" ? global : window);