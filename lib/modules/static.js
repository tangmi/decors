var log = require('../log'),
	express = require('express');

module.exports = function(appdir, options) {
	log.info('Serving static files from', appdir);
	return function(req, res, next) {

		var actualpath = req.path;
		if (req.path.lastIndexOf('/') === req.path.length - 1) {
			actualpath += 'index.html';
		}
		log.response(req.method, res.statusCode, 'local', actualpath);
		express.static(appdir)(req, res, next);
	};
};