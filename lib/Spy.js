/**
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
		spy.reset = function() {
			spy.callCount = 0;
			spy.myArguments.length = 0;
			spy.scopes.length = 0;
			spy.lastArguments = null;
			spy.lastScope = null;
		};

		spy.reset();
		return spy;
	}

	sas.Spy.spyMethod = function(object, method) {
		if (typeof object == 'function')
			object = object.prototype;

		var original = object[method];
		if (typeof original != 'function')
			throw new Error("Property --[" + method + "]-- of --[" + object + "]-- is not a function");

		var spy = object[method] = new sas.Spy(original);
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
