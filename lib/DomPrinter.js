/**
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
});
