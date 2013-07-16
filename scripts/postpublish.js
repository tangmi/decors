// increment patch version number
var fs = require('fs');

var package = require('../package.json'),
	version = package.version;

var oldversion = version;

var regex = new RegExp(/([0-9]\.[0-9]\.)([0-9])/);

var first = version.replace(regex, '$1');
var minor = version.replace(regex, '$2');

package.version = first + (parseInt(minor) + 1);

fs.writeFile('package.json', JSON.stringify(package, null, '\t'), function(err) {
	console.log('Incrementing', package.name,'version from', oldversion, 'to', package.version);
});