#!/usr/bin/env node


/*

	TODO: REMOVE `.JS` FROM NAME

*/

/*
	CLI stuffs
*/
var exec = require('child_process').exec,
	program = require('commander'),
	package = require('../package.json'),
	path = require('path');

program.version(package.version);
program.option('-w, --watch', 'reload app and inject css on file save');
program.option('-b, --backend <baseurl>', 'have decors make backend requests to eliminate CORS issues')
program.option('-p, --port <port>', 'set a custom port (default 9000)')
program.parse(process.argv);

var appdir = path.resolve(program.args.shift() || '.');

/*
	server stuffs
*/
var express = require('express'),
	livereload = require('connect-livereload'),
	http = require('http'),
	https = require('https'),
	fs = require('fs');

var app = express();

app.set('port', program.port || 9000);

// watch file tree for changes and use the livereload middleware to update the client
if (program.watch) {
	var liveReloadPort = 35729;

	app.use(function(req, res, next) {
		console.log('using livereload');

		livereload({
			port: liveReloadPort
		})(req, res, next);
	});
}

// reroute backend API calls to a separate backend server, avoiding all CORS issues on the client side
if (program.backend) {
	app.use(function(req, res, next) {
		if (fs.existsSync(path.join(appdir, req.path))) {
			next();
		} else {
			if (program.backend.lastIndexOf('/') === program.backend.length - 1) {
				program.backend.substring(0, program.backend.length - 2);
			}
			if (req.path.indexOf('/') !== 0) {
				req.path = '/' + req.path;
			}

			var remotepath = program.backend + req.path;
			if (remotepath.indexOf('http') !== 0) {
				remotepath = 'http://' + remotepath;
			}

			var regex = new RegExp('^([a-zA-Z]+)://([^/]+)(?:\:([0-9]+))(/.*)?$');
			var protocol = remotepath.indexOf('https') === 0 ? https : http;

			var reqoptions = {
				host: remotepath.replace(regex, '$2'),
				port: remotepath.replace(regex, '$3'),
				path: remotepath.replace(regex, '$4'),
				type: req.method
			};

			console.log('Making remote call:', remotepath);

			var remoterequest = protocol.request(reqoptions, function(data) {
				var output = '';
				data.setEncoding('utf8');

				data.on('data', function(chunk) {
					output += chunk;
				});

				data.on('end', function() {
					res.statusCode = data.statusCode;
					res.headers = data.headers;
					res.contentType(data.headers['content-type']);
					res.send(output);
				});
			});

			remoterequest.on('error', function(e) {
				res.contentType('text/plain');
				res.send('Error: ' + e.message + '\n' + e.stack);
			});

			remoterequest.end();
		}
	});
}

// use the connect static middleware
app.use(function(req, res, next) {
	var actualpath = req.path;
	if (req.path.lastIndexOf('/') === req.path.length - 1) {
		actualpath += 'index.html';
	}
	console.log('Serving local file:', actualpath);
	express.static(appdir)(req, res, next);
});

/*
	begin the actual server
*/
http.createServer(app).listen(app.get('port'), function() {
	console.log('Decors server listening on port', app.get('port'));
	console.log('with directory:', appdir);
});