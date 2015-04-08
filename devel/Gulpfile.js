/*
This Gulpfile is used to build a development version of the library and
example game all together from the main sources, for development use.
*/

var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    less = require ('gulp-less'),
    browserSync = require('browser-sync');

var reload = browserSync.reload;

gulp.task('lib', function () {
  return gulp.src('../undum/lib/*.js')
        .pipe(gulp.dest('./build/lib/'));
});

gulp.task('undularity', function () {
  return gulp.src('../undularity/undularity.js')
        .pipe(gulp.dest('./build/lib/'));
});

gulp.task('js-template', function () {
  return gulp.src('../template/js/*.js')
        .pipe(gulp.dest('./build/game/'));
});

gulp.task('browserify', ['lib', 'undularity', 'js-template'], function () {
  return browserify('./build/game/main.js')
    .transform(babelify)
    .bundle()
    .on("error", function (err) { console.log ("Error: " + err.message)})
    .pipe(source('undum.js'))
    .pipe(gulp.dest('./build/game/'))
    .pipe(reload({stream: true}));

});

gulp.task('less', function () {
  return gulp.src('../template/less/undum.less')
        .pipe(less())
        .pipe(gulp.dest('./build/css/'))
        .pipe(reload({stream: true}));
});

gulp.task('html', function () {
  return gulp.src('../template/html/index.html')
        .pipe(gulp.dest('./build/'))
        .pipe(reload({stream: true}));

});

gulp.task('default', function () {
  gulp.start('browserify');
  gulp.start('less');
  gulp.start('html');
});

gulp.task('serve', ['default'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: './build'
  });

  gulp.watch('../template/less/*.less', ['less']);
  gulp.watch('../template/html/*.html', ['html']);
  gulp.watch('../undum/lib/*.js', ['browserify']);
  gulp.watch('../undularity/undularity.js', ['browserify']);
  gulp.watch('../template/js/*.js', ['browserify']);

});