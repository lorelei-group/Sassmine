/**
 * Copyright © 2009-2012 A. Matías Quezada
 */


/*
function Animal() {
	this._alive = true;
}
Animal.prototype.die = function() {
	this._alive = false;
};
Animal.prototype.talk = function(message) {
	return this._alive ? 'Hello' : "I'm dead!";
};

function God() {
}
God.prototype.talkTo = function(animal) {
	if (animal.talk('Hi, mortal') !== "I'm dead!")
		this.bless(animal);
	else
		return 'The animal is dead!';
};
God.prototype.bless = function() {
	animal.blessed = true;
};


function GodTest() {
	var god = new God('Zeus');
	var mock = new Mock(Animal);
	
	console.log(mock.talk()); // undefined
	mock.talk.result('Hola');
	console.log(mock.talk()); // 'Hola';
	mock.talk.fake(function(message) {
		return message === 'Hi, mortal' ?
			"I'm not a mortal anymore" :
			'You are not my god';
	});
	console.log(mock.talk('Hi')); // You are not my god

	console.log(mock.talk.getCallCount()); // 3
	console.log(mock.talk.getArguments()); // [ [], [], [ 'Hi' ] ]
	console.log(mock.talk.getLastScope() === mock); // true

	console.log(mock.blessed); // undefined
	god.talkTo(mock);
	console.log(mock.blessed); // true
}
*/