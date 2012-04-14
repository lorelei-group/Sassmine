/**
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

});
