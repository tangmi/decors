//logging tool

module.exports = function() {
	if (global.quiet) {
		return;
	}
	console.log.apply(console, arguments);
}