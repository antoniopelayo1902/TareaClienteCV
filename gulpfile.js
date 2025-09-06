const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();
const esbuild = require('esbuild');
const gulpIf = require('gulp-if');

const isProd = process.env.NODE_ENV === 'production';
const paths = {
  html: 'src/**/*.html',
  styles: 'src/scss/main.scss',
  stylesWatch: 'src/scss/**/*.scss',
  scriptsEntry: 'src/ts/main.ts',
  scriptsWatch: 'src/ts/**/*.ts',
  images: 'src/assets/images/**/*',
  data: 'src/data/**/*',
  dist: 'dist'
};

function clean() {
  return del.deleteAsync([paths.dist]);
}

function styles() {
  return gulp.src(paths.styles, { allowEmpty: true })
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), isProd && cssnano()].filter(Boolean)))
    .pipe(gulpIf(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(`${paths.dist}/assets/css`))
    .pipe(browserSync.stream());
}

async function scripts() {
  await esbuild.build({
    entryPoints: [paths.scriptsEntry],
    bundle: true,
    minify: isProd,
    sourcemap: !isProd,
    target: ['es2018'],
    outfile: `${paths.dist}/assets/js/main.js`
  });
  browserSync.reload();
}

function html() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
}

function images() {
  return gulp.src(paths.images, { allowEmpty: true })
    .pipe(gulp.dest(`${paths.dist}/assets/images`));
}

function data() {
  return gulp.src(paths.data)
    .pipe(gulp.dest(`${paths.dist}/data`));
}

function serve() {
  browserSync.init({
    server: { baseDir: paths.dist },
    open: false
  });
  gulp.watch(paths.stylesWatch, styles);
  gulp.watch(paths.scriptsWatch, scripts);
  gulp.watch(paths.html, html);
  gulp.watch(paths.images, images);
  gulp.watch(paths.data, data);
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, html, images, data));
const dev = gulp.series(build, serve);

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.images = images;
exports.data = data;
exports.build = build;
exports.dev = dev;
exports.default = dev;
