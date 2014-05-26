var fs = require('fs'),
	path = require('path');

module.exports.path = function() {
	var cwd = process.cwd(),
		filename = 'decorsfile';

	var dir = fs.readdirSync(cwd);
	for (var i = 0; i < dir.length; i++) {
		var file = dir[i];

		var filenoext;
		if (file.indexOf('.') != -1) {
			filenoext = file.substr(0, file.indexOf('.'));
		} else {
			filenoext = file;
		}
		if (filenoext.toLowerCase() == filename.toLowerCase()) {
			return path.join(cwd, file);
		}
	}
	return null;
};

module.exports.inject = function(dfpath, dest, allowed) {
	var df = fs.readFileSync(dfpath);
	try {
		df = JSON.parse(df);
	} catch(e) {
		console.log('Could not parse Decorsfile!');
		console.log(e.stack);
		process.exit(1);
	}

	for(var i = 0; i < allowed.length; i++) {
		var allow = allowed[i];

		if(df[allow]) {
			dest[allow] = df[allow];
		}
	}
};