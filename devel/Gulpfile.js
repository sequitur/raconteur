/*
This Gulpfile is used to build a development version of the library and
example game all together from the main sources, for development use.
*/

var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    less = require ('gulp-less'),
    browserSync = require('browser-sync'),
    watchify = require('watchify'),
    gutil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    buffer = require('vinyl-buffer')
    _ = require('lodash');

var reload = browserSync.reload;

/* Watchify setup */

var watchifyOpts = {
  entries: ['./js/main.js'],
  debug: true,
  transform: [babelify]
};

var opts = _.assign({}, watchify.args, watchifyOpts);
var bundler = watchify(browserify(opts));

var bundle = function () {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true,
      sourceRoot: "../../../"
    }))
    .on('error', gutil.log.bind(gutil, 'Sourcemaps Error'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build/game'))
    .pipe(reload({stream: true}));
}

/*

gulp.task('browserify', function () {
  return browserify('../templates/js/main.js')
    .transform(babelify)
    .bundle()
    .on("error", function (err) { console.log ("Error: " + err.message)})
    .pipe(source('undum.js'))
    .pipe(gulp.dest('./build/game/'))
    .pipe(reload({stream: true}));

});

*/

gulp.task('js', bundle);
bundler.on('update', bundle);
bundler.on('log', gutil.log);

gulp.task('less', function () {
  return gulp.src('less/undum.less')
        .pipe(less())
        .pipe(gulp.dest('./build/css/'))
        .pipe(reload({stream: true}));
});

gulp.task('html', function () {
  return gulp.src('html/index.html')
        .pipe(gulp.dest('./build/'))
        .pipe(reload({stream: true}));

});

gulp.task('default', function () {
  gulp.start('js');
  gulp.start('less');
  gulp.start('html');
});

gulp.task('serve', ['default'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: './build'
  });

});