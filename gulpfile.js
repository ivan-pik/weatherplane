var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('sass', function() {
  return sass('src/scss/stylesheet.scss')
    .pipe(gulp.dest('src/public/css'))
    .pipe(reload({ stream:true }));
});

// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['sass'], function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  });

  gulp.watch('src/scss/*.scss', ['sass']);
});
