var assert = require('assert'),
	express = require('express'),
	decors = require('../lib/index'),
	http = require('http'),
	request = require('supertest'),
	path = require('path');

describe('Static server', function() {
	var base = 'http://localhost:9000';

	before(function(done) {
		decors.start({
			dir: path.join(__dirname),
			port: 9000,
			quiet: true
		}, function() {
			done();
		});
	});

	it('should serve static files', function(done) {
		request(decors.getExpressInstance())
			.get('/local.html')
			.expect('get static', done);
	});

	it('should fail when no file is found', function(done) {
		request(decors.getExpressInstance())
			.get('/get2.html')
			.expect(404, done);
	});

	after(function(done) {
		decors.stop();
		done();
	});

});

describe('Backend configuration', function() {

	before(function(done) {
		decors.start({
			dir: path.join(__dirname),
			backend: 'localhost:9001',
			port: 9000,
			quiet: true
		}, function() {
			done();
		});
	});

	describe('Remote methods', function() {
		var server = null;
		before(function(done) {
			var testapp = express();
			testapp.set('port', 9001);
			testapp.use(express.urlencoded());
			testapp.use(express.json());
			testapp.get('/remote/get/:number', function(req, res) {
				res.send(req.param('number'));
			});
			testapp.post('/remote/post', function(req, res) {
				res.send(req.param('number'));
			});
			testapp.get('/remote/img/binary.png', function(req, res) {
				// res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Content-Type', 'image/png');
				res.send('decors');
			});

			server = http.createServer(testapp);
			server.listen(testapp.get('port'), function() {
				done();
			});
		});

		it('should grab remote GET requests', function(done) {
			var num = "5";
			request(decors.getExpressInstance())
				.get('/remote/get/' + num)
				.expect(num, done);
		});

		it('should grab remote POST requests', function(done) {
			var num = "5";
			request(decors.getExpressInstance())
				.post('/remote/post')
				.send({
					number: num
				})
				.expect(num, done);
		});

		it('should correctly download binary files', function(done) {
			request(decors.getExpressInstance())
				.get('/remote/img/binary.png')
				.expect('Content-Type', 'image/png')
				.expect('decors', done);
		});

		after(function(done) {
			server.close();
			done();
		});
	});

	describe('Gzip passthrough', function() {
		var server = null;
		before(function(done) {
			var zlib = require('zlib');

			var testapp = express();
			testapp.set('port', 9001);
			testapp.use(express.urlencoded());
			testapp.use(express.json());

			testapp.get('/remote/gzip', function(req, res) {
				res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Content-Type', 'text/plain');
				zlib.gzip('decors', function(err, data) {
					res.send(data);
				});
			});

			server = http.createServer(testapp);
			server.listen(testapp.get('port'), function() {
				done();
			});
		});

		it('should grab remote GET requests', function(done) {
			request(decors.getExpressInstance())
				.get('/remote/gzip')
				.expect('decors', done);
		});

		after(function(done) {
			server.close();
			done();
		});
	});

	after(function(done) {
		decors.stop();
		done();
	});

});