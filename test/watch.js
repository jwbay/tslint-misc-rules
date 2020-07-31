var chokidar = require('chokidar')
var execSync = require('child_process').execSync
var path = require('path')

chokidar
	.watch('rules/*.js', { ignoreInitial: true })
	.on('change', (file) => handleSourceChange(file))
	.on('add', (file) => handleSourceChange(file))
chokidar
	.watch('test/**/*.{json,lint,fix}', { ignoreInitial: true })
	.on('change', (file) => handleTestChange(file))
	.on('add', (file) => handleTestChange(file))

function handleSourceChange(file) {
	runTest(path.basename(file, path.extname(file)))
}

function handleTestChange(file) {
	var dirs = path.dirname(file).split(path.sep)
	runTest(dirs[dirs.length - 1])
}

function runTest(ruleName) {
	try {
		execSync('node test/runner ' + ruleName, {
			stdio: 'inherit',
		})
	} catch (e) {}
}
