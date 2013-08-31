var colors = require('colors');

//logging tool

module.exports.info = function() {
	log.apply(this, arguments);
}

//logs the method/statuscoode/etc of a response returned from decors
module.exports.response = function(method, statuscode, location, message) {
	arguments[0] = arguments[0].toString().green;

	if (arguments[1].toString()[0] === '4') {
		arguments[1] = arguments[1].toString().red;
	} else {
		arguments[1] = arguments[1].toString().magenta;
	}

	if (location === 'remote') {
		arguments[2] = arguments[2].toString().yellow;
	} else {
		arguments[2] = arguments[2].toString().cyan;
	}

	log.apply(this, Array.prototype.slice.call(arguments));
}

function log() {
	if (global.quiet) {
		return;
	}
	console.log.apply(console, arguments);
}