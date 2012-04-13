/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function() {
	global = this;

	function resolveNamespace(ns) {
		var path = ns.split('.');

		var current = use.root;
		for (var i = 0; i < path.length; i++)
			current = current[path[i]] = current[path[i]] || {};

		return current;
	}

	function use(var_args) {
		var namespaces = [];

		for (var i = 0; i < arguments.length; i++)
			namespaces[i] = resolveNamespace(arguments[i]);

		return {
			on: function(callback) {
				callback.apply(use.root, namespaces);
			}
		};
	}

	use.isNodejs = typeof module !== 'undefined' && module.exports;
	//typeof window === 'undefined'

	use.root = global;
	global.use = use;

})();

use().on(function() {

	function wrap(object, parent, method) {
		var original = object[method];
		var code = original.toString();
		if (code.indexOf('this.base') === -1 && code.indexOf('this.proto') === -1)
			return;

		var base = parent[method];
		var wrapper_to_allow_base = function wrapper_to_allow_base() {
			var baseValue = this.base, protoValue = this.proto;
			(this.base = base), (this.proto = parent);
			var result = original.apply(this, arguments);
			(this.base = baseValue), (this.proto = protoValue);
			return result;
		}
		wrapper_to_allow_base.toString = function() {
			return original.toString();
		};

		object[method] = wrapper_to_allow_base;
	}

	var prototype = ({}).__proto__ ?
		function prototype(child, parent) {
			child.__proto__ = parent;
			return child;
		} :
		function prototype(config, parent) {
			function intermediate() { }
			intermediate.prototype = parent;
			var child = new intermediate();

			for (var i in config) if (config.hasOwnProperty(i))
				child[i] = config[i];

			return child;
		};

	var Class = global.Class = function() { };
	Class.extend = function(config) {
		var base = this.prototype;
		config = config || {};

		if (!config.hasOwnProperty('constructor'))
			config.constructor = function() {
				this.base.apply(this, arguments);
			};

		for (var i in config) if (config.hasOwnProperty(i) && typeof config[i] === 'function')
				wrap(config, base, i);

		var clazz = prototype(config.constructor, this);
		clazz.prototype = prototype(config, this.prototype);

		if (!clazz.extend)
			clazz.extend = Class.extend;

		return clazz;
	};
});
/**
 * Copyright © 2009-2012 A. Matías Quezada
 */


use('sassmine').on(function(sas) {

	sas.ConsolePrinter = Class.extend({

		ERROR: '\033[1;31;41m',
		SUITE: '\033[32m',
		SPEC: '\033[1,32m',
		RESTORE: '\033[39m',

		spacer: '\t',
		
		constructor: function() {
			this.base();
			this.indent = 0;
		},

		getIndent: function() {
			var result = '';
			for (var i = indent; i--; )
				result += this.spacer;
			return result;
		},

		addLevel: function() {
			this.indent++;
		},

		removeLevel: function() {
			this.indent--;
		},

		print: function(type, message) {
			if (type === sas.MessageType.ERROR)
				return console.log(this.ERROR + message + this.RESTORE)

			var pre = type === sas.MessageType.SUITE ? this.SUITE : this.SPEC;
			console.log(pre + message + this.RESTORE);
		}

	});

});/**
 * Copyright © 2009-2012 A. Matías Quezada
 */
use('sassmine').on(function(sas) {
	sas.DomPrinter = Class.extend({

		SUITE: 'sassmine sassmineSuite',
		SPEC_HIDE: 'sassmine sassmineSpec sassmineHide',
		SPEC: 'sassmine sassmineSpec',
		ERROR: 'sassmineErrorMessages',
		FAIL: 'sassmineFailed',

		constructor: function() {
			this.base();
			this.root = document.createElement('div');
			this.current = this.root;

			var self = this;
			window.onload = function() {
				document.body.appendChild(self.root);
			};
		},

		addLevel: function(type) {
			var div = document.createElement('div');
			var self = this;

			div.className = type === sas.MessageType.SUITE ? this.SUITE : this.SPEC;

			this.current.appendChild(div);
			this.current = div;
		},

		removeLevel: function() {
			this.current = this.current.parentNode;
		},

		print: function(type, message) {
			var div = document.createElement('div');
			div.innerHTML = message;

			this.current.appendChild(div);

			if (type === sas.MessageType.ERROR) {
				div.className = this.ERROR;
				return this.fail();
			}
		},

		fail: function(message) {
			var current = this.current;
			while (current !== this.root) {
				if (current.className.indexOf(this.FAIL) === -1)
					current.className += ' ' + this.FAIL;
				current = current.parentNode;
			}
		}
	});
});/**
 * Copyright © 2009-2012 A. Matías Quezada
 */


use('sassmine').on(function(sas) {

	var Block = Class.extend({

		constructor: function(message, code) {
			this.base();
			this.message = message;
			this.code = code;

			this.before = [];
			this.after = [];
		},

		execute: function() {
			this.code.call(null, sas);
		},

		addBeforeEach: function(action) {
			this.before.push(action);
		},

		addAfterEach: function(action) {
			this.after.push(action);
		},

		beforeEach: function() {
			for (var i = 0; i < this.before.length; i++)
				this.before[i].call(null, sas);
		},

		afterEach: function() {
			for (var i = 0; i < this.after.length; i++)
				this.after[i].call(null, sas);
		}

	});

	sas.Spec = sas.Suite = Block.extend();

});/**
 * Copyright © 2009-2012 A. Matías Quezada
 */
/**
 * A re-implementation of Jasmine (http://pivotal.github.com/jasmine/) just for fun
 *
 * Author:
 *	Seldaiendil <seldaiendil2@gmail.com>
 *	A. Matías Q. <amatiasq@gmail.com>
 */

use('sassmine').on(function(sas) {

 	sas.BlockType = {
		SUITE: 1,
		SPEC: 2,
	};

 	sas.MessageType = {
		SUITE: 1,
		SPEC: 2,
		ERROR: 3
	};

	sas.Sassmine = Class.extend({

		printer: new (use.isNode ? sas.ConsolePrinter : sas.DomPrinter),

		constructor: function() {
			this.base();

			this.levels = [ new sas.Suite('root suite') ];
			this.current = 0;
		},

		addBlock: function(type, node) {
			this.printer.addLevel(type);
			this.printer.print(type, node.message);

			var parent = this.levels[this.current];
			this.current = this.levels.length;
			this.levels[this.current] = node;

			if (sas.DEBUG) {
 				parent.beforeEach();
 				node.execute();
 				parent.afterEach();
				this.levels.length--;
				this.current--;
			} else {
	 			try {
	 				parent.beforeEach();
	 				node.execute();
	 				parent.afterEach();
				} catch(err) {
					this.fail(err);
				} finally {
					this.levels.length--;
					this.current--;
				}
			}

 			this.printer.removeLevel();
		},

 		fail: function(error) {
			this.printer.print(sas.MessageType.ERROR, error.message);
		},

		describe: function(message, code) {
			this.addBlock(sas.BlockType.SUITE, new sas.Suite(message, code));
		},

		it: function(message, code) {
			this.addBlock(sas.BlockType.SPEC, new sas.Spec(message, code));
		},

		beforeEach: function(action) {
			this.levels[this.current].addBeforeEach(action);
		},

		afterEach: function(action) {
			this.levels[this.current].addBeforeEach(action);
		}
	});


	// this is global
	var defaultInstance = new sas.Sassmine();

	this.xdescribe = function() { };
	this.describe = function(message, action) {
		defaultInstance.describe(message, action);
	};

	this.xit = function() { };
	this.it = function(message, action) {
		defaultInstance.it(message, action);
	};

	this.beforeEach = function(action) {
		defaultInstance.beforeEach(action);
	};
	this.afterEach = function(action) {
		defaultInstance.afterEach(action);
	}

	this.expect = function(value) {
		return new sas.Expectation(value);
	};
});
/**
 * Copyright © 2009-2012 A. Matías Quezada
 */


use('sassmine').on(function(sas) {

	sas.ExpectationError = Class.extend.call(Error, {
		constructor: function(message) {
			this.base(message);
			this.message = message;
		}
	});

	/*
	 * Expectations
	 * Private class
	 * Instances of this class will be returned when call expect() function
	 * Each expectation instance has a subinstance 'not', than reverses the result
	 */
	var ExpectationBase = Class.extend({

		to: '',
		success: null,

		constructor: function(value) {
			this.base();
			this.value = value;
			this.and = this;
		},

		test: function(bool, message) {
			if (bool !== this.success)
				throw new sas.ExpectationError(message);
			return this;
		},

		printObject: function(object) {
			return '--[' + object + ']-- (' + (typeof object) + ')';
		},

		standardMsg: function(target, text, objetive) {
			var end = typeof objetive !== 'undefined' ? ' ' + this.printObject(objetive) : '';
			return "Expected " + this.printObject(this.value) + this.to + text + end;
		},


		// Comparison expectations
		toBe: function(objetive) {
			return this.test(this.value === objetive, this.standardMsg(this.value, 'be', objetive));
		},
		toBeLike: function(objetive) {
			return this.test(this.value == objetive, this.standardMsg(this.value, "be like", objetive));
		},
		toBeTrue: function() {
			return this.test(this.value === true, this.standardMsg(this.value, "be", true));
		},
		toBeFalse: function() {
			return this.test(this.value === false, this.standardMsg(this.value, "be", false));
		},
		toBeTruthy: function() {
			return this.test(!!this.value, this.standardMsg(this.value, "be truthy"));
		},
		toBeFalsy: function() {
			return this.test(!this.value, this.standardMsg(this.value, "be falsy"));
		},
		toBeNull: function() {
			return this.test(this.value === null, this.standardMsg(this.value, "be", null));
		},
		toBeUndefined: function() {
			return this.test(typeof this.value === 'undefined', this.standardMsg(this.value, "be undefined"));
		},
		toBeNaN: function() {
			return this.test(isNaN(this.value), this.standardMsg(this.value, "be", NaN));
		},
		
		// Numeric expectations
		toBeBetween: function(val1, val2) {
			return this.test(this.value >= Math.min(val1, val2) && this.value <= Math.max(val1, val2),
				"Expected " + this.printObject(this.value) + this.to + "be between " +
					this.printObject(val1) + " and " + this.printObject(val2));
		},
		toBeLowerThan: function(num) {
			return this.test(this.value < num, this.standardMsg(this.value, "be lower than", num));
		},
		toBeBiggerThan: function(num) {
			return this.test(this.value > num, this.standardMsg(this.value, "be bigger than", num));
		},
		toBePositive: function() {
			return this.test(this.value > 0, this.standardMsg(this.value, "be positive"));
		},
		toBeNegative: function() {
			return this.test(this.value < 0, this.standardMsg(this.value, "be negative"));
		},
		
		// Class expectations
		toBeArray: function() {
			return this.test(Object.prototype.toString.call(this.value) === "[object Array]",
				this.standardMsg(this.value, "be a array"));
		},
		toBeFunction: function() {
			return this.test(this.value instanceof Function, this.standardMsg(this.value, "be a function"));
		},
		toBeInstanceOf: function(clazz) {
			return this.test(this.value instanceof clazz, this.standardMsg(this.value, "be instance of", clazz));
		},
		toHaveProperty: function(name) {
			return this.test(name in this.value,
				this.standardMsg(this.value, "have property --[" + name + "]--"));
		},
		toHaveOwnProperty: function(name) {
			return this.test(this.value.hasOwnProperty(name),
				this.standardMsg(this.value, "have property --[" + name + "]--"));
		},
		
		// Error handle expectations
		toThrowError: function() {
			if (!(this.value instanceof Function))
				throw new Error("Target is not a function");
			try {
				this.value.call(null);
			} catch (ex) {
				return this.test(true,
					"Expected --[" + this.value + "]-- " + this.to + " throw error but --[" +
					ex + "]-- thrown with message --[" + ex.message + "]--");
			}
			return this.test(false, "Expected --[" + this.value + "]-- " + this.to + " throw a error");
		},
		toThrow: function(errorClass) {
			if (!(this.value instanceof Function))
				throw new Error("Target is not a function");
			try {
				this.value.call(null);
			} catch (ex) {
				return this.test(ex instanceof errorClass,
					"Expected --[" + this.value + "]-- " + this.to + " throw --[" + errorClass +
					"]-- but --[" + ex + "]-- thrown");
			}
			return this.test(false, "Expected --[" + this.value + "]-- " + this.to + " throw a error");
		}
	});

	var NegativeExpectation = ExpectationBase.extend({
		success: false,
		to: ' to not '
	});

	sas.Expectation = ExpectationBase.extend({
		success: true,
		to: ' to ',
		
		constructor: function(value) {
			this.base(value);
			this.not = new NegativeExpectation(value);
		}
	});
});/**
 * Copyright © 2009-2012 A. Matías Quezada
 */


use('sassmine').on(function(sas) {

	sas.Spy = function(original) {
		var returnResult = false;
		var result;
		var fake;
		var callOriginal;
		var myArguments = [];

		function spy() {
			spy.callCount++;

			var args = Array.prototype.slice.call(arguments);
			// spy.arguments is the function arguments object
			myArguments.push(args);
			spy.scopes.push(this);

			spy.lastArguments = args;
			spy.lastScope = this;

			spy.arguments = myArguments;

			if (returnResult)
				return result;

			if (typeof fake === 'function')
				return fake.apply(this, arguments);

			if (callOriginal)
				return original.apply(this, arguments);
		}

		spy.result = function(value) {
			fake = null;
			returnResult = true;
			result = value;
		};
		spy.fake = function(funct) {
			returnResult = false;
		};
		spy.setCallOriginal = function(value) {
			callOriginal = value;
		};

		spy.callCount = 0;
		spy.scopes = [];

		return spy;
	}

	sas.Spy.spyMethod = function(object, method) {
		if (typeof object == 'function')
			object = object.prototype;

		var original = object[method];
		if (typeof original != 'function')
			throw new Error("Property --[" + method + "]-- of --[" + object + "]-- is not a function");

		var spy = object[method] = new Spy(original);
		spy.restore = function() {
			object[method] = original;
		}
	};

	sas.Mock = function(clazz) {
		var origin, mock;

		if (typeof clazz === 'function') {
			origin = mock = new clazz();
		} else {
			origin = clazz;
			mock = {};
		}

		for (var i in origin) if (i !== 'constructor')
			mock[i] = Spy.spyMethod(origin, i);

		return mock;
	};

});
