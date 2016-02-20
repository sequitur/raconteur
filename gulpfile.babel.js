import gulp from 'gulp';
import mocha from 'gulp-mocha';
import babel from 'gulp-babel';

function test () {
  return gulp.src('test/*.js')
    .pipe(mocha());
}

function prepublish () {
  return gulp.src('lib/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
}

gulp.task('default', test);
gulp.task('prepublish', prepublish);
