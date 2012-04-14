# Makefile for amatiasq/Sassmine

build:
	cat \
		deps/jsbase/lib/use.js \
		deps/jsbase/lib/class.js \
		lib/ConsolePrinter.js \
		lib/DomPrinter.js \
		lib/Block.js \
		lib/Sassmine.js \
		lib/Expectation.js \
		lib/Spy.js \
		> build.js

update:
	git pull
	git submodule update

test: build
	node test/test.js

browser-test:
	firefox test/test.html

clean:
	rm build.js

