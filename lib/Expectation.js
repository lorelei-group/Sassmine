/**
 * Copyright © 2009-2012 A. Matías Quezada
 */


use('sassmine').on(function(sas) {

	sas.ExpectationError = Class.extend.call(Error);

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
		},

		test: function(bool, message) {
			if (bool !== this.success)
				throw new sas.ExpectationError(message);
			return true;
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
});