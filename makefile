# Makefile for amatiasq/Sassmine

build:
	cat deps/jsbase/init.js sassmine.js > build.js

update:
	git pull
	git submodule update

test:
	node test/test.js

browser-test:
	firefox test/test.html

clean:
	rm build.js

