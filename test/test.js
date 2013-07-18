var assert = require('assert'),
	express = require('express'),
	decors = require('../lib/index'),
	http = require('http'),
	request = require('supertest'),
	path = require('path');

var testapp = express();

testapp.set('port', 9001);

testapp.use(express.bodyParser());

testapp.get('/remote/get/:number', function(req, res) {
	res.send(req.param('number'));
});

testapp.post('/remote/post', function(req, res) {
	res.send(req.param('number'));
});



http.createServer(testapp).listen(testapp.get('port'), function() {});


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

describe('Routing', function() {
	var base = 'http://localhost:9000';

	describe('Static server', function() {
		it('should serve static files', function(done) {
			request(decors.getExpressInstance())
				.get('/get.html')
				.expect('get static', done);
		});
	});
	describe('Remote methods', function() {
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
	});
});