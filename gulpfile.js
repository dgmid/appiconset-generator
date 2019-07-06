const 	gulp 			= require('gulp'),
		sass 			= require('gulp-sass'),
		rename 			= require('gulp-rename'),
		autoprefixer 	= require('gulp-autoprefixer'),
		sourcemaps 		= require('gulp-sourcemaps'),
		htmlmin 		= require('gulp-htmlmin')
		cssnano 		= require('gulp-cssnano'),
		uglify 			= require('gulp-uglify-es').default,
		pump 			= require('pump'),
		iconutil 		= require('gulp-iconutil'),
		exec 			= require('child_process').exec



const	sourceCss 		= 'app-source/scss/*.scss',
		destCss 		= 'dist/css',
		sourceJs 		= 'app-source/js/*.js',
		destJs 			= 'dist/js',
		sourceHtml 		= 'app-source/html/*.html',
		destHtml 		= 'dist/html',
		sourceSvg 		= 'app-source/assets/svg/*.svg',
		destSvg 		= 'dist/assets/svg',
		sourceJson 		= 'app-source/json/*.json',
		destJson 		= 'dist/json',
		sourceLang 		= 'app-source/i18n/**/*.json',
		destLang 		= 'dist/i18n'



gulp.task('sass', () => {

	return gulp.src(sourceCss)
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(destCss))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(destCss))
})



gulp.task('html', () => {
	
	return gulp.src(sourceHtml)
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(destHtml))
})



gulp.task('js', done => {
	
	pump([
			gulp.src(sourceJs),
			sourcemaps.init(),
			uglify().on('error', function(uglify) {
				console.error(`ERROR: ${uglify.name}, in: ${uglify.filename}`)
				console.error(`line: ${uglify.line}, col: ${uglify.col}`)
				console.error(uglify.message)
				this.emit('end')
			}),
			rename({suffix: '.min'}),
			sourcemaps.write('./maps'),
			gulp.dest(destJs)
		]
	)
	
	done()
})



gulp.task('svg', () => {
	
	return gulp.src(sourceSvg)
		.pipe(gulp.dest(destSvg))
})



gulp.task('icns', () => {

	return gulp.src('./app-source/assets/AppIcon.appiconset/icon_*.png')
		.pipe(iconutil('icon.icns'))
		.pipe(gulp.dest('./dist/assets/icon/'))
})



gulp.task('icon', () => {	
	
	return gulp.src('./app-source/assets/AppIcon.appiconset/icon_128x128@2x.png')
		.pipe(rename('icon.png'))
		.pipe(gulp.dest('./dist/assets/icon/'))
})



gulp.task('json', () => {
	
	return gulp.src(sourceJson)
		.pipe(gulp.dest(destJson))
})



gulp.task('i18n', () => {
	
	return gulp.src(sourceLang)
		.pipe(gulp.dest(destLang))
})



gulp.task('build', gulp.series(	'sass',
								'html',
								'js',
								'svg',
								'json',
								'i18n',
								'icns',
								'icon'
), done => {
	
	done()
})



gulp.task('watch', gulp.series(gulp.parallel('html', 'js', 'sass', 'i18n'), () => {
	
	gulp.watch('app-source/html/**/*.html', gulp.series('html')),
	gulp.watch('app-source/js/**/*.js', gulp.series('js')),
	gulp.watch('app-source/scss/**/*.scss', gulp.series('sass')),
	gulp.watch('app-source/i18n/**/*.json', gulp.series('i18n'))
	
	return
}))
