var fs = require('fs'),
    stream = require('stream');

var dirs = [
  './game',
  './game/game',
  './game/html',
  './game/less',
  './game/lib'
];

var files = {
  './template/html/index.html': './game/html/index.html',
  './template/less/undum.less': './game/less/undum.less',
  './template/less/undum-mobile.less': './game/less/undum-mobile.less',
  './undum/lib/undum.js': './game/lib/undum.js',
  './undum/lib/random.js': './game/lib/random.js',
  './undularity/undularity.js': './game/lib/undularity.js',
  './template/Gulpfile.js': './game/Gulpfile.js',
  './template/js/main.js': './game/game/main.js'
};

dirs.forEach(function (dir) {
  fs.mkdirSync(dir);
});

Object.keys(files).forEach(function (key) {
  fs.createReadStream(key).pipe(fs.createWriteStream(files[key]));
});
