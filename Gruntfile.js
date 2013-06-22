module.exports = function(grunt) {

	var http = require('http');
	var https = require('https');

	var urlPrefix = '_decors';
	var decors = function(req, res, next) {
		var path = req.originalUrl;
		if (path.match(urlPrefix)) {
			var url = path.substring(('/' + urlPrefix + '/').length);

			var regex = new RegExp('^([a-zA-Z]+)://([^/]+)(/.*)?$');
			var protocol = url.replace(regex, '$1') == 'https' ? https : http;
			var restRequest = protocol.request({
				host: url.replace(regex, '$2'),
				path: url.replace(regex, '$3'),
				type: req.method
			}, function(data) {

				var body = '';

				data.on('data', function(chunk) {
					body += chunk;
				});

				data.on('end', function() {
					res.statusCode = data.statusCode;
					res.headers = data.headers;
					res.end(body);
				});

			}).on('error', function(e) {
				res.end(JSON.stringify({
					'status': 'error',
					'message': e
				}, undefined, 2));
			});

			req.content = '';
			req.addListener('data', function(chunk) {
				req.content += chunk;
			});
			req.addListener('end', function() {
				restRequest.headers = req.headers;
				restRequest.write(req.content);
				restRequest.end();
			});

		} else {
			next();
		}

		var time = ('[' + (new Date).toLocaleTimeString() + ']');

		grunt.log.writeln('').write(time.grey + ' ' + res.statusCode.toString().yellow + ' ' + req.originalUrl);
	};

	var LIVERELOAD_PORT = 35729;

	var livereload = require('connect-livereload')({
		port: LIVERELOAD_PORT
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		watch: {
			options: {
				nospawn: true
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
						'app/**/*',
				]
			}
		},
		connect: {
			options: {
				port: 9000,
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function(connect) {
						var middleware = [];
						middleware[0] = decors;
						middleware[1] = livereload;
						middleware[2] = connect.static(require('path').resolve('app'));
						return middleware;
					}
				}
			}
		},
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>'
			}
		}
	});
	grunt.registerTask('default', [
			'connect:livereload',
			'open:server',
			'watch:livereload'
	]);
	grunt.event.on('watch', function(action, filepath) {
		grunt.log.writeln('');
	});
};