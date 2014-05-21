var log = require('../log'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	mime = require('mime'),
	http = require('http'),
	https = require('https');

var request = require('request');

var MemoryStream = require('memorystream');

module.exports = function(appdir, options) {
	// remove trailing slash on url
	if (options.backend.lastIndexOf('/') === options.backend.length - 1) {
		options.backend = options.backend.substring(0, options.backend.length - 1);
	}

	// add defaut protocol in not around
	if (!/[a-zA-Z]+:\/\//.test(options.backend)) {
		console.log(options.backend);
		options.backend = 'http://' + options.backend;
	}

	log.info('Rerouting API calls to:', options.backend);

	return function(req, res, next) {

		var stream = new MemoryStream();

		delete req.headers['accept-encoding'];

		var qs = require('url').parse(req.url).query;
		var remotepath = options.backend + req.path + (qs ? '?' + qs : '');

		req.pipe(request(options.backend + req.path, function(error, response, body) {
			if (error) {
				log.response(req.method, '400', 'remote', remotepath);
				res.send(400);
				throw error;
			}

			log.response(req.method, response.statusCode, 'remote', remotepath);
		})).pipe(stream);

		var chunks = [];

		stream.on('data', function(chunk) {
			chunks.push(chunk);
		});

		stream.on('end', function(chunk) {
			if (chunk) {
				chunks.push(chunk);
			}
			var data = Buffer.concat(chunks).toString();
			res.write(data);
			res.end();
		});

	};
};