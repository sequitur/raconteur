var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    less = require ('gulp-less');

gulp.task('browserify', function () {
  return browserify('./game/main.js')
    .transform(babelify)
    .bundle()
    .on("error", function (err) { console.log ("Error: " + err.message)})
    .pipe(source('undum.js'))
    .pipe(gulp.dest('./dist/game/'));
});

gulp.task('less', function () {
  return gulp.src('./less/undum.less')
        .pipe(less())
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('html', function () {
  return gulp.src('./html/index.html')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', function () {
  gulp.start('browserify');
  gulp.start('less');
  gulp.start('html');
});