var fs = require('fs');

var log = require('../log'),
	express = require('express');

module.exports = function(appdir, options) {

	var contents;

	if (fs.existsSync(options.inject)) {
		try {
			contents = fs.readFileSync(options.inject).toString();
		} catch (e) {
			log.info('ERR'.red, e.message);
			process.exit(1);
		}
		log.info('Injecting contents of ' + options.inject);
	} else {
		contents = options.inject;
		log.info('Injecting string: "' + options.inject + '"');
	}

	return require('connect-inject')({
		snippet: contents,
		rules: [{
			match: /<\/head>/,
			fn: function prepend(w, s) {
				return s + w;
			}
		}]
	});
};