// livereload watch module

var log = require('../log'),
	tinylr = require('tiny-lr'),
	livereload = require('connect-livereload'),
	chokidar = require('chokidar');

var liveReloadPort = 35729;

module.exports = function(appdir) {
	//start up livereload server
	var server = tinylr();

	server.listen(liveReloadPort, function(err) {
		if (err) {
			log.info(err);
			return;
		}
		log.info('Watching directory for changes...');
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
			log.info(error);
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

	return livereload({
		port: liveReloadPort
	});
}