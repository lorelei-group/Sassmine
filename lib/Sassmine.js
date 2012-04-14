/**
 * Copyright © 2009-2012 A. Matías Quezada
 */
/**
 * A re-implementation of Jasmine (http://pivotal.github.com/jasmine/) just for fun
 *
 * Author:
 *	Seldaiendil <seldaiendil2@gmail.com>
 *	A. Matías Q. <amatiasq@gmail.com>
 */

use.alias('sassmine', 'sas');

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

	debugger;
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
