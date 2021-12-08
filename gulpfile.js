const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require('sass'));
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const del = require("del");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
}

exports.html = html;

// Image

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 8, progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
}

exports.images = images;

// Webp

const createWebp = () => {
  return gulp.src("source/img/*.png")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"));
  }

exports.createWebp = createWebp;

// Clean build

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Copy files

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/*.webmanifest",
    "source/img/**/*.{jpg,png,svg}",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false
  });
  done();
}

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

// Build

const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    html,
    styles,
    createWebp
  )
);

exports.build = build;

exports.default = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    html,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
