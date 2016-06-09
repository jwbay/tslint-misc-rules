var fs = require('fs');
var path = require('path');
var os = require('os');
var execSync = require('child_process').execSync;

var directories = fs.readdirSync(path.join(process.cwd(), 'test'))
    .filter(name => !path.extname(name));

var exitCode = 0;

directories.forEach(testFolder => {
    try {
        execSync('node ./node_modules/tslint/lib/tslint-cli.js --test test/' + testFolder, {
            stdio: 'inherit',
            encoding: 'utf8'
        });
    } catch (err) {
        if (typeof err.signal === 'undefined') {
            console.error(err.stack);
        }
        exitCode = 1;
        console.log(os.EOL, os.EOL);
    }
});

process.exit(exitCode);