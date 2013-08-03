var log = require('../log'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	mime = require('mime'),
	http = require('http'),
	https = require('https');

module.exports = function(appdir, options) {
	if (options.backend.lastIndexOf('/') === options.backend.length - 1) {
		options.backend = options.backend.substring(0, options.backend.length - 1);
	}
	log('Rerouting API calls to:', options.backend);
	return function(req, res, next) {

		//add some middleware to save the raw body
		req.setEncoding('utf8');
		req.rawBody = '';
		req.on('data', function(chunk) {
			req.rawBody += chunk;
		});
		req.on('end', function() {
			reroute();
		});

		//actually reroute the backend call

		function reroute() {
			//for the empty directory index.html edge case
			var indexExists = fs.existsSync(path.join(appdir, req.path, 'index.html'));
			if (fs.existsSync(path.join(appdir, req.path))) {
				next();
			} else if (req.path.lastIndexOf('/') == req.path.length - 1 && indexExists) {
				next();
			} else {
				if (req.path.indexOf('/') !== 0) {
					req.path = '/' + req.path;
				}

				var remotepath = options.backend + req.path;
				if (remotepath.indexOf('http') !== 0) {
					remotepath = 'http://' + remotepath;
				}

				var querystring = url.parse(req.url).query;
				if (typeof querystring !== 'undefined' && querystring != null) {
					remotepath += '?' + querystring;
				}

				var regex = new RegExp('^([a-zA-Z]+)://([^/]+)(?:\:([0-9]+))(/.*)?$');
				var protocol = remotepath.indexOf('https') === 0 ? https : http;

				var reqoptions = {
					host: remotepath.replace(regex, '$2'),
					port: remotepath.replace(regex, '$3'),
					path: remotepath.replace(regex, '$4'),
					method: req.method,
					headers: req.headers
				};

				if (options.port == reqoptions.port) {
					res.send(404);
					log((req.method + '').green, '404'.red, 'remote'.yellow, remotepath, ('(recursive call)').grey);
					return;
				}

				var remoterequest = protocol.request(reqoptions, function(data) {
					var output = '';

					var useutf8 = /text\/.+/.test(mime.lookup(req.path)); //determines the data transfer encoding

					if (useutf8) {
						data.setEncoding('utf8');
					} else {
						data.setEncoding('binary');
					}

					data.on('data', function(chunk) {
						output += chunk;
					});

					data.on('end', function() {
						res.statusCode = data.statusCode;
						res.headers = data.headers;
						res.setHeader('Content-Type', data.headers['content-type']);
						res.setHeader('Content-Length', output.length);
						if (useutf8) {
							res.send(output);
						} else {
							res.write(output, encoding = 'binary');
							res.end();
						}

						log((req.method + '').green, (res.statusCode + '').magenta, 'remote'.yellow, remotepath);
					});
				});

				remoterequest.write(req.rawBody);

				remoterequest.on('error', function(e) {
					res.contentType('text/plain');
					res.send(404);
					log((req.method + '').green, '404'.red, 'remote'.yellow, remotepath, ('(' + e.message + ')').grey);
				});

				remoterequest.end();
			}
		}
	};
};