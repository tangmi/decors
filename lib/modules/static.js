var log = require('../log'),
	express = require('express');

module.exports = function(appdir, options) {
	log('Serving static files from', appdir);
	return function(req, res, next) {

		var actualpath = req.path;
		if (req.path.lastIndexOf('/') === req.path.length - 1) {
			actualpath += 'index.html';
		}
		log((req.method + '').green, (res.statusCode + '').magenta, 'local'.cyan, actualpath);
		express.static(appdir)(req, res, next);
	};
};