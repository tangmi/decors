var fs = require('fs');

var log = require('../log'),
	express = require('express');

module.exports = function(appdir, options) {
	log.info('Injecting contents of ' + options.inject);

	var contents;
	try {
		contents = fs.readFileSync(options.inject).toString();
	} catch (e) {
		log.info('ERR'.red, e.message);
		process.exit(1);
	}

	return function logResponseBody(req, res, next) {
		var oldWrite = res.write,
			oldEnd = res.end;

		var chunks = [];

		req.on('close', function() {
			res.write = res.end = function() {};
		});

		res.flush = noop;

		res.write = function(chunk) {
			chunks.push(chunk);
			oldWrite.apply(res, arguments);
		};

		res.end = function(chunk, encoding) {
			if (chunk) {
				chunks.push(chunk);
			}

			var body = Buffer.concat(chunks).toString();
			console.log(req.path, body);


			console.log(res.body);

			console.log(arguments);
			arguments['0'] = new Buffer('what what ' + body + 'hi there');
			console.log(arguments);
			oldEnd.apply(res, arguments);
		};

		next();
	};
};

function noop() {}