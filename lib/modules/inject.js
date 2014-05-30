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

	var injectstr = [
		'',
		'',
		'<!-- DECORS INJECTED CONTENT -->',
		contents,
		'<!-- END DECORS INJECTED CONTENT -->',
		'',
		'$1'
	].join('\n');

	return require('connect-injector')(function(req, res) {
		return res.getHeader('content-type').indexOf('text/html') !== -1;
	}, function(callback, data, req, res) {
		callback(null,
			data.toString()
			.replace(/(<\/head>)/, injectstr));
	});
};