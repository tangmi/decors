/*
	server stuffs
*/
var express = require('express'),
	tinylr = require('tiny-lr'),
	livereload = require('connect-livereload'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	chokidar = require('chokidar'),
	stream = require('stream'),
	url = require('url'),
	mime = require('mime'),
	path = require('path'),
	colors = require('colors'),
	package = require(path.join(__dirname, '../package.json'));

function startServer(options, onStart) {
	var options = options || {};

	function log() {
		if (options.quiet) {
			return;
		}
		console.log.apply(console, arguments);
	}

	var appdir;
	if (options.dir) {
		appdir = options.dir;
	} else {
		console.log('Must have a static directory specified when running programmatically.');
		process.exit(1);
	}


	log();
	log(' decors' + ('@' + package.version).grey);
	log();

	var app = express();

	app.set('port', options.port || 9000);

	// watch file tree for changes and use the livereload middleware to update the client
	var liveReloadPort = 35729;
	if (options.watch) {
		//add in the middleware
		app.use(require('connect-livereload')({
			port: liveReloadPort
		}));

		//start up livereload server
		var server = tinylr();
		server.listen(liveReloadPort, function(err) {
			if (err) {
				log(err);
				return;
			}
			log('Watching directory for changes...');
		});

		//set up file watchers
		var watcher = chokidar.watch(appdir, {
			// ignored: /.*((?:\.css)|(?:\.js(on)?))$/, //matches .css, .js, .json
			persistent: true,
			ignoreInitial: true,
			interval: 500,
			binaryInterval: 3000,
		});

		watcher
			.on('add', reload)
			.on('change', reload)
			.on('unlink', reload)
			.on('error', function(error) {
				log(error);
			});

		function reload(file) {
			var files = [];
			files.push(file);

			server.changed({
				body: {
					files: files
				}
			});
		};

	}

	// reroute backend API calls to a separate backend server, avoiding all CORS issues on the client side
	if (options.backend) {

		//add some middleware to save the raw body
		app.use(function(req, res, next) {
			req.setEncoding('utf8');
			req.rawBody = '';
			req.on('data', function(chunk) {
				req.rawBody += chunk;
			});
			req.on('end', function() {
				next();
			});
		});

		log('Rerouting API calls to:', options.backend)
		app.use(function(req, res, next) {

			//for the empty directory index.html edge case
			var indexExists = fs.existsSync(path.join(appdir, req.path, 'index.html'));
			if (fs.existsSync(path.join(appdir, req.path))) {
				next();
			} else if (req.path.lastIndexOf('/') == req.path.length - 1 && indexExists) {
				next();
			} else {
				if (options.backend.lastIndexOf('/') === options.backend.length - 1) {
					options.backend.substring(0, options.backend.length - 2);
				}
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

				if (app.get('port') == reqoptions.port) {
					res.end(404);
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
		});
	}

	// use the connect static middleware
	log('Serving static files from', appdir);
	app.use(function(req, res, next) {
		var actualpath = req.path;
		if (req.path.lastIndexOf('/') === req.path.length - 1) {
			actualpath += 'index.html';
		}
		log((req.method + '').green, (res.statusCode + '').magenta, 'local'.cyan, actualpath);
		express.static(appdir)(req, res, next);
	});

	/*
	begin the actual server
	*/
	module.exports._server = http.createServer(app);
	module.exports._server.listen(app.get('port'), function() {
		log('Decors server started on port', app.get('port'));
		log();
		if (onStart) {
			onStart();
		}
	});

	module.exports._app = app;
}


function stopServer() {
	try {
		module.exports._server.close();
		log('Server closed successfully');
	} catch (e) {
		log('Server not running');
	}
	process.exit(0);
}

function getExpressInstance() {
	return module.exports._app;
}

module.exports = {
	start: startServer,
	stop: stopServer,
	getExpressInstance: getExpressInstance
};