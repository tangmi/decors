/*
 * server stuffs
 */
var log = require('./log'),
	express = require('express'),
	http = require('http'),
	path = require('path'),
	package = require(path.join(__dirname, '../package.json'));


function getModules(app, appdir, options) {
	// load all the used modules, the earlier a module appears, the higher "priority" it has
	var modules = [];

	if (options.watch) {
		// watch file tree for changes and use the livereload middleware to update the client
		modules.push('./modules/watch');
	}

	if (options.backend) {
		// reroute backend API calls to a separate backend server, avoiding all CORS issues on the client side
		modules.push('./modules/backend.js');
	}

	// use the connect static middleware
	modules.push('./modules/static.js');

	return modules;
}


function startServer(options, onStart) {
	var options = options || {};

	global.quiet = options.quiet;

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

	// initialize the express app
	var app = express();
	options.port = options.port || 9000;
	app.set('port', options.port);

	// get the modules
	var modules = getModules(app, appdir, options);
	// actually load the modules
	var i = 0,
		l = modules.length;
	for (; i < l; i++) {
		app.use(require(modules[i])(appdir, options));
	}

	// start the server
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
	// process.exit(0);
}

function getExpressInstance() {
	return module.exports._app;
}

module.exports = {
	start: startServer,
	stop: stopServer,
	getExpressInstance: getExpressInstance
};