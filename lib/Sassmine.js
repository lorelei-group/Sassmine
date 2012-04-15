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
			this.waiting = false;
			this.deferred = [];
		},

		addBlock: function(type, node) {
			if (this.waiting) {
				this.deferred.push([ type, node ]);
				return;
			}

			this.printer.addLevel(type);
			this.printer.print(type, node.message);

			var parent = this.levels[this.current];

			this.current = this.levels.length;
			this.levels[this.current] = node;

			parent.beforeEach();

			var prom = node.execute();
			parent.promises.push(prom);

			var self = this;
			function finish() {
				parent.afterEach();
				self.levels.length--;
				self.current--;
				self.printer.removeLevel();
			}

			prom.then(finish, function(err) {
				self.fail(err);
				finish();
			});
		},

		block: function(timeout) {
			var waiting = this.waiting = Math.random() + 1;
			this.waitingLevels = this.levels.slice();
			var self = this;
			setTimeout(function() {
				if (self.waiting != waiting)
					return;

				self.fail('Timeout reached for blocking method.');
				self.resume();
			}, timeout || 5000);
		},

		resume: function() {
			this.waiting = false;
			for (var i = 0, len = this.deferred.length; i < len; i++)
				this.addBlock.apply(this, this.deferred[i]);
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
