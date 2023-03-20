/* REQUIRE MODULES */
// Gulp
import gulp from 'gulp';
import { deleteAsync } from 'del';
export const reset = () => {
  return deleteAsync(['dist'])
}
import fs from 'fs';
// Tools
import browserSync from "browser-sync";
import plumber from "gulp-plumber";
import map from "gulp-sourcemaps";
import htmlreplace from "gulp-html-replace";
import fonter from 'gulp-fonter';
// SVG
import svgsprite from "gulp-svg-sprite";
import cheerio from "gulp-cheerio";
import replace from "gulp-replace";
// Styles
import sass from 'gulp-sass';
import prefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import concat from 'gulp-concat';
// Images
import changed from 'gulp-changed';
import imagemin from "gulp-imagemin";
import recompress from 'imagemin-jpeg-recompress';
import pngquant from 'imagemin-pngquant';
import multiDest from 'gulp-multi-dest';
import webpConv from 'gulp-webp';
// Fonts
import ttf2woff2 from 'gulp-ttf2woff2';
// Javscript
import terser from 'gulp-terser';
import babel from 'gulp-babel';
// Other
import gcmq from 'gulp-group-css-media-queries';
/* TASKS */
/* develop */
// serve
gulp.task('serve', function (done) {
    browserSync.init({
        server: {
            baseDir: "app",
        },
        notify: false,
        open: true,
        port: 80,
        files: ['app/*.html', ''],
    });
    gulp.watch("app/**/*.sass", gulp.series('styles'));
    gulp.watch("app/**/*.html").on('change', () => {
        browserSync.reload();
        done();
    });
    gulp.watch("app/js/**/*.js").on('change', () => {
      browserSync.reload();
      done();
    });
    gulp.watch("app/img/src/", gulp.series('images', 'webp', 'imagescopy'));
    gulp.watch("app/img/svg-ui-icons/", gulp.series('svgsprite'));
});
// styles
gulp.task('styles', function (done) {
    return gulp.src('app/sass/**/*.sass')
    .pipe(map.init())
    .pipe(sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError))
      .pipe(gulp.dest('app/css/'))
      .pipe(browserSync.stream())
});
// images
gulp.task('images', function (done) {
	return gulp.src('app/img/src/**/*.+(png|jpg|jpeg|gif|svg|ico)')
		.pipe(changed('app/img/dist'))
		.pipe(imagemin({
				interlaced: true,
				progressive: true,
				optimizationLevel: 5,
			},
			[
				recompress({
					loops: 6,
					min: 50,
					max: 90,
					quality: 'high',
					use: [pngquant({
						quality: [0.8, 1],
						strip: true,
						speed: 1
					})],
				}),
				imagemin.gifsicle(),
				imagemin.optipng(),
				imagemin.svgo()
			], ), )
		.pipe(gulp.dest('app/img/dist'))
  	.pipe(browserSync.stream())
});
// webp
gulp.task('webp', function (done) {
  return gulp.src('app/img/dist/*.+(png|jpg|jpeg)')
      .pipe(plumber())
      .pipe(changed('app/img/dist', {
        extension: '.webp'
      }))
      .pipe(webpConv())
      .pipe(multiDest(['app/img/src', 'app/img/dist']))
})
// imagescopy
gulp.task('imagescopy', function (done) {
  return gulp.src([
		'app/img/**/*',
  ])
  .pipe(gulp.dest('dist/img'));
});
// svgsprite
gulp.task('svgsprite', function (done) {
  return gulp.src('app/img/svg-ui-icons/**/*')
    .pipe(gulp.dest('dist/img/svg-ui-icons'))
    .pipe(svgsprite({
      mode: {
        stack: {
          sprite: 'svg-ui-sprite',
          dest: '.',
          example: false,
        },
      }
    }))
    .pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
    .pipe(replace('&gt;', '>'))
    .pipe(multiDest(['app/img', 'dist/img']))
});
// fonts
gulp.task('otftottf', function (done) {
  // преобразование otf в ttf
  return gulp.src('app/fonts/**/*.otf')
  .pipe(fonter({
    formats: ['ttf']
  }))
  // выгрузка в эту же папку
  .pipe(gulp.dest('app/fonts/'))
  // преобразование ttf в woff2
  .pipe(gulp.src('app/fonts/**/*.ttf'))
  .pipe(ttf2woff2())
  .pipe(gulp.dest('dist/fonts/'))
});
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* BUILDS */
/* BUILD-COMPRESS */
// gulp-clean
gulp.task('dist-clean', function(){
  return deleteAsync('dist/**', {force:true});
});
// bc-stylesBuild
gulp.task('bc-stylesBuild', function (done) {
  return gulp.src('app/css/**/*.css')
    .pipe(prefixer({
      overrideBrowserslist: ['last 8 versions'],
      browsers: [
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 11',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6',
      ],
    }))
    .pipe(gcmq())
    .pipe(cleanCss({
      level: 2
    }))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('dist/css/'))
});
// bc-stylesLibs
gulp.task('bc-stylesLibs', function (done) {
  return gulp.src('app/libs/**/*.css')
  .pipe(prefixer({
    overrideBrowserslist: ['last 8 versions'],
    browsers: [
      'Android >= 4',
      'Chrome >= 20',
      'Firefox >= 24',
      'Explorer >= 11',
      'iOS >= 6',
      'Opera >= 12',
      'Safari >= 6',
    ],
  }))
  .pipe(gcmq())
  .pipe(cleanCss({
    level: 2
  }))
  .pipe(concat('libs.min.css'))
  .pipe(gulp.dest('dist/css/'))
});
// bc-javascriptBuild
gulp.task('bc-javascriptBuild', function(done) {
  return gulp.src('app/js/**/*.js')
  .pipe(terser())
	.pipe(concat('main.min.js'))
	.pipe(gulp.dest('dist/js/'))
});
// bc-javascriptLibs
gulp.task('bc-javascriptLibs', function(done) {
  return gulp.src('app/libs/**/*.js')
  .pipe(terser())
	.pipe(concat('libs.min.js'))
	.pipe(gulp.dest('dist/js/'))
});
// bc-buildcopy
gulp.task('bc-buildcopy', function (done) {
  return gulp.src([
		'app/fonts/**/*',
    'app/**/*.html',
  ], {base: 'app/'})
  .pipe(gulp.dest('dist'));
});
// bc-htmlreplace
gulp.task('bc-htmlreplace', function() {
  return gulp.src('dist/**/*.html')
    .pipe(htmlreplace({
        'css': ['css/libs.min.css', 'css/main.min.css'],
        'js': ['js/libs.min.js', 'js/main.min.js']
    }))
    .pipe(gulp.dest('dist/'));
});
// build-compress
gulp.task('buildCompress', gulp.series(
  'dist-clean',
  'styles',
  'bc-stylesBuild',
  'bc-stylesLibs',
  'bc-javascriptBuild',
  'bc-javascriptLibs',
  'images',
  'webp',
  'imagescopy',
  'bc-buildcopy',
  'bc-htmlreplace',
));
/* BUILD-NEXTDEV */
/* bn-stylesBuild */
gulp.task('bn-stylesBuild', function (done) {
  return gulp.src(['app/css/**/*.css', '!app/css/**/*.min.css'])
    .pipe(prefixer({
      overrideBrowserslist: ['last 8 versions'],
      browsers: [
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 11',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6',
      ],
    }))
    .pipe(gcmq())
    .pipe(cleanCss( { level: { 2: { specialComments: 0 } }, format: 'beautify' } ))
    .pipe(gulp.dest('dist/css/'))
});
// bn-buildcopy
gulp.task('bn-buildcopy', function (done) {
  return gulp.src([
		'app/fonts/**/*',
    'app/**/*.html',
    'app/css/**/*.min.css',
    'app/libs/**/*',
    'app/js/**/*'
  ], {base: 'app/'})
  .pipe(gulp.dest('dist'));
});
// buildNextdev
gulp.task('buildNextdev', gulp.series(
  'dist-clean',
  'styles',
  'bn-stylesBuild',
  'images',
  'webp',
  'imagescopy',
  'bn-buildcopy',
));