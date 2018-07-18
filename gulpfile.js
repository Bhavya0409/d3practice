const gulp = require('gulp');
const pump = require('pump');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const path = require('path');

const paths = {
    src: ['public/js/*.js'],
    build: 'public/build',
    // Must be absolute or relative to source map
    sourceRoot: path.join(__dirname, 'public'),
};

gulp.task('babel', function () {
    pump([
        gulp.src(paths.src),
        plumber(),
        babel(),
        gulp.dest(paths.build)
    ])
});

gulp.task('watch', function() {
    gulp.watch(paths.src, ['babel']);
});

gulp.task('default', ['watch']);