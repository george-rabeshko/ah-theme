var gulp = require('gulp'), // gulp JS
	browserSync = require('browser-sync').create(), // browsersync
    sass = require('gulp-ruby-sass'), // SCSS maintenance
	autoprefixer = require('gulp-autoprefixer'), // CSS autoprefixer
    csso = require('gulp-csso'), // CSS minify
	uncss = require('gulp-uncss'), // unCSS
    uglify = require('gulp-uglify'), // JS minify
	imagemin = require('gulp-imagemin'), // images minimisation
	pngquant = require('imagemin-pngquant'),
    imageminJpegtran = require('imagemin-jpegtran'),
	wiredep = require('wiredep').stream, // wiredep
	useref = require('gulp-useref'), // useref
    gulpif = require('gulp-if'), // look on changes in html
    concat = require('gulp-concat'), // patching files
	rename = require('gulp-rename');
	
// default task
gulp.task('default', ['css', 'bower', 'browser-sync-s']);

// process JS files
gulp.task('js', function () {
    gulp.src('./docs/js/*.js')
		.pipe(browserify({
		  insertGlobals : true,
		  debug : !gulp.env.production
		}))
		.pipe(gulp.dest('./docs/js'));
});

gulp.task('js-watch', ['js'], browserSync.reload);

// process SCSS files and return CSS
gulp.task('css', function() {
    return sass('./src/sass/**/*.scss')
        .on('error', sass.logError)
		.pipe(autoprefixer({
			browsers: ['last 3 versions'],
			cascade: false
		}))
        .pipe(gulp.dest('./docs/css'))
        .pipe(browserSync.stream());
});

// unCSS usage
gulp.task('uncss', function () {
    return gulp.src('./docs/css/*.css')
        .pipe(uncss({
            html: './docs/*.html'
        }))
        .pipe(gulp.dest('./docs/css/*.css'));
});

// bower
gulp.task('bower', function () {
	gulp.src('./docs/*.html')
		.pipe(wiredep({
			directory: './src/bower'
		}))
		.pipe(gulp.dest('./docs'));
});

// image minimisation
gulp.task('image-to-mini', function () {
	return gulp.src('./docs/images/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
        .pipe(imageminJpegtran({progressive: true})())
		.pipe(gulp.dest('./release/images'));
});

// release
gulp.task('release', ['image-to-mini'], function () {
    return gulp.src('./docs/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', csso()))
        .pipe(gulp.dest('release'));
});
	
// static server
gulp.task('browser-sync-s', function() {
    browserSync.init({
        server: './'
    });

    gulp.watch('./src/sass/*.scss', ['css']);
	gulp.watch('./docs/js/*.js', ['js-watch']);
    gulp.watch('./docs/*.html').on('change', browserSync.reload);
    gulp.watch('bower.json', ['bower']);
});

// dynamic server
gulp.task('browser-sync-d', function() {
    browserSync.init({
        proxy: 'ah-theme'
    });
});