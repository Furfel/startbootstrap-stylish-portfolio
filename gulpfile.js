"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const template = require("gulp-template");
const data = require("gulp-data");
const fs = require("fs");
const fspath = require("path");
const fileinc = require("gulp-file-include");

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

const dest_build = "./build/";

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: dest_build
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del([dest_build + "vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest(dest_build + 'vendor/bootstrap'));
  // Font Awesome CSS
  var fontAwesomeCSS = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
    .pipe(gulp.dest(dest_build + 'vendor/fontawesome-free/css'));
  // Font Awesome Webfonts
  var fontAwesomeWebfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
    .pipe(gulp.dest(dest_build + 'vendor/fontawesome-free/webfonts'));
  // jQuery Easing
  var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest(dest_build + 'vendor/jquery-easing'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest(dest_build + 'vendor/jquery'));
  // Simple Line Icons
  var simpleLineIconsFonts = gulp.src('./node_modules/simple-line-icons/fonts/**')
    .pipe(gulp.dest(dest_build + 'vendor/simple-line-icons/fonts'));
  var simpleLineIconsCSS = gulp.src('./node_modules/simple-line-icons/css/**')
    .pipe(gulp.dest(dest_build + 'vendor/simple-line-icons/css'));

  var img = gulp.src('./img/**/*').pipe(gulp.dest(dest_build + 'img'));
  
  return merge(bootstrap, fontAwesomeCSS, fontAwesomeWebfonts, jquery, jqueryEasing, simpleLineIconsFonts, simpleLineIconsCSS, img);
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest(dest_build + "css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(dest_build + "css"))
    .pipe(browsersync.stream());
}

//Tempaltes to HTML task
function tpl2html() {
  return gulp
    .src("./templates/*.html")
    .pipe(
      data(
        function(file) {
          var merged = {};

          var template_json = "./templates/" + fspath.basename(file.path.replace('\.html', '')) + ".json";
          try {
            fs.accessSync(template_json, fs.constants.F_OK);
          } catch(e) {
            return merged;
          }
          var template_data = JSON.parse(fs.readFileSync(template_json));
          Object.keys(template_data).forEach(k => merged[k] = template_data[k]);
        
          return merged;
        }
      )
    )
    .pipe(template())
    .pipe(gulp.dest("./html/"))
    .pipe(gulp.dest( dest_build + "html/" ));
}

//HTML task
function html() {
  return gulp
    .src("./*.html")
    .pipe(fileinc({
      prefix: '@@',
      basepath: '@root',
      context: {
        content: ''
      }
    }))
    .pipe(gulp.dest(dest_build))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dest_build + 'js'))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*", '!./build/**/*'], js);
  gulp.watch(["./*.html", "./html/*.html"], gulp.series(html, browserSyncReload));
  gulp.watch("./templates/*", tpl2html);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, tpl2html, gulp.parallel(html, css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
exports.html = html;
