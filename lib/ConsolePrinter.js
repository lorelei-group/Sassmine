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

});