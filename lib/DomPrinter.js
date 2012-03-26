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
			this.open = this.open.bind(this);

			var self = this;
			window.onload = function() {
				document.body.appendChild(self.root);
			};
		},

		addLevel: function(type) {
			var div = document.createElement('div');
			var self = this;

			if (type === sas.MessageType.SUITE) {
				div.className = this.SUITE;
				if (sas.DEBUG)
					div.onclick = function() {
						this.open
					};
			} else {
				div.className = sas.DEBUG ? this.SPEC : this.SPEC_HIDE;
			}

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
				this.show(current);

				if (current.className.indexOf(this.FAIL) === -1)
					current.className += ' ' + this.FAIL;
				current = current.parentNode;
			}
		},

		show: function(element) {
			if (element.className.indexOf('sassmineHide') !== -1)
				element.className.replace(/sassmineHide/, '');
		},

		open: function() {
			console.log('opening');
			var div = this;
			div.onclick = null;
			this.recursiveOpen(div);
		},

		recursiveOpen: function(element) {
			var child = element.children();
			for (var i = child.length; i--; ) {
				this.recursiveOpen(child[i]);
				this.show(child[i]);
			}
		}
	});

});