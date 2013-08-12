// VERY basic directory listing. this is more of a proof-of-concept for decors modules more than anything

var log = require('../log'),
	path = require('path'),
	fs = require('fs');

module.exports = function(appdir, options) {

	return function(req, res, next) {
		if (req.path.lastIndexOf('/') == req.path.length - 1 && req.path.length > 1) {
			var dir = path.join(appdir, req.path);
			log.response(req.method, '200', 'directory', dir);

			fs.readdir(dir, function(err, files) {
				if (!err) {
					var output = [],
						dirs = [];
					var i = 0,
						l = files.length;
					for (; i < l; i++) {
						var file = files[i];
						var stat = fs.statSync(path.join(dir, file));
						var size = stat.size;
						var mtime = stat.mtime;
						var isDir = stat.isDirectory();
						if (isDir) {
							file = file + '/';
							dirs.push('<a href="' + file + '">' + file + '</a> ' + size + 'b ' + mtime);
						} else {
							output.push('<a href="' + file + '">' + file + '</a> ' + size + 'b ' + mtime);
						}

					}

					res.send(dirs.join('<br>') + '<br>' + output.join('<br>'));

				} else {
					next();
				}
			});

		} else {
			next();
		}
	};

}