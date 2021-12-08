import gulp from "gulp";
import plumber from "gulp-plumber";
import sourcemap from "gulp-sourcemaps";
import sass from "gulp-dart-sass";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import autoprefixer from "autoprefixer";
import csso from "postcss-csso";
import htmlmin from "gulp-htmlmin";
import imagemin from "gulp-imagemin";
import webp from "gulp-webp";
import del from "del";
import browser from "browser-sync";

// Styles

export const styles = () => {
  return gulp.src("source/sass/style.scss", { sourcemaps: true })
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css", { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

export const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
}

// Image

export const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 8, progressive: true}),
      imagemin.svgo(
        {
          plugins: [
            { optimizationLevel: 3 },
            { progessive: true },
            { interlaced: true },
            { removeViewBox: false },
            { removeUselessStrokeAndFill: false },
            { cleanupIDs: false }
         ]
       }
      )
    ]))
    .pipe(gulp.dest("build/img"));
}

// Webp

export const createWebp = () => {
  return gulp.src("source/img/*.png")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"));
  }

// Clean build

export const clean = () => {
  return del("build");
};

// Copy files

export const copy = (done) => {
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

// Server

export const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    html,
    styles,
    createWebp
  )
);

export default gulp.series(
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
