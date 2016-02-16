import gulp from 'gulp';
import mocha from 'gulp-mocha';

function test() {
  return gulp.src('test/*.js')
    .pipe(mocha());
}

gulp.task('default', test);
