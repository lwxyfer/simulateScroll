var gulp = require('gulp');
var bs = require('browser-sync');
// var ghPages = require('gulp-gh-pages');
// var markJSON = require('markit-json');
// var docUtil = require('amazeui-doc-util');
// var rename = require('gulp-rename');

gulp.task('server', () => {
  bs.init({
    server: {
      baseDir: './src'
    }
  });
  gulp.watch('src/*', () => {
    bs.reload();
  })
})

// deploy doc to gh-pages
gulp.task('deploy', () => {
  return gulp.src('README.md')
  .pipe(ghPages())
})

// generate doc html files
gulp.task('markdoc', () => {
  return gulp.src('README.md')
    .pipe(markJSON(docUtil.markedOptions))
    .pipe(docUtil.applyTemplate())
    .pipe(rename(function(file) {
      file.extname = '.html';
    }))
    .pipe(gulp.dest('./dist'));
});
