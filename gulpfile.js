const gulp = require('gulp');
const template = require('gulp-template');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const execSync = require('child_process').execSync;
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;
const merge = require('merge-stream');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');

let localeData = null;
let appIconBig = null;
let appIconSmall = null;
let channelImage = null;
let categoryImage = null;
let lang = null;

/**
 * Edits the 'js/util/locale.js' file. Adds:
 *  - selected locale
 *  - app name
 *  - app version
 */
gulp.task('editLocaleFile', () => {
    let targetLocale = 'var selectedLocale = \'' + lang + '\';';
    let targetAppName = 'var appName = \'' + localeData.channel + '\';';
    let targetAppVersion = 'var appVersion = \'' + localeData.appInfoVersion + '\';';

    return gulp.src(['js/util/locale.js'])
        .pipe(replace(/var selectedLocale =[^\n]*/g, targetLocale))
        .pipe(replace(/var appName =[^\n]*/g, targetAppName))
        .pipe(replace(/var appVersion =[^\n]*/g, targetAppVersion))
        .pipe(gulp.dest('js/util/'));
});

gulp.task('localizeTexts', () =>
    gulp.src([
        'appinfo.json'
    ])
    .pipe(template({
        appInfoId: localeData.appInfoId,
        appInfoVersion: localeData.appInfoVersion,
        appInfoVendor: localeData.appInfoVendor,
        appInfoTitle: localeData.appInfoTitle,
        appInfoDescription: localeData.appInfoDescription
    })).pipe(gulp.dest('tmp'))
);

gulp.task('cleanDist', () => 
    gulp.src('dist/' + lang, {read: false, allowEmpty: true})
        .pipe(clean())
);

gulp.task('cleanAll', () => 
    gulp.src('dist', {read: false, allowEmpty: true})
        .pipe(clean())

);

gulp.task('cleanTmp', () => 
    gulp.src('tmp', {read: false, allowEmpty: true})
        .pipe(clean())
);

gulp.task('copyToDist', () => 
    gulp.src([
        'css/**/*.*',
        'html/**/*.*',
        'js/**/*.*',
        'images/arrow_back.svg',
        'images/arrow_left.svg',
        'images/arrow_right.svg',
        'images/play.svg',
        'images/pause.svg',
        'images/tv.svg',
        'images/archive.svg',
        'images/archive_white.svg',
        'images/guide.svg',
        'images/search.svg',
        'images/favorites.svg',
        'images/favorites_not_selected.svg',
        'images/settings.svg',
        'images/episode.svg',
        'images/series.svg',
        'images/backspace.svg', 
        'images/capslock.svg', 
        'images/letter.svg', 
        'images/space.svg', 
        'images/error.svg',
        'images/info.svg',
        'images/end.svg',
        'images/specialchar.svg', 
        'images/arrow_up_down.png',
        'images/logo.png',
        'images/tv7logo.png',
        'images/' + channelImage,
        'images/' + categoryImage,
        'index.html',
        'appinfo.json'
    ], { base: './' })
        .pipe(gulp.dest('dist/' + lang))
);

gulp.task('compressJs', () => {
    return pipeline(
        gulp.src([
            'js/**/*.js', 
            '!js/anime/*.js', 
            '!js/handlebars/*.js', 
            '!js/videojs/*.js',
            '!js/webOSTVjs-1.2.2/*.js'
        ]),
        uglify(),
        gulp.dest('dist/' + lang + '/js')
    );
});

gulp.task('compressCss', () => {
    return gulp.src([
        'css/*.css',
        '!css/videojs/*.css', 
        ])
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist/' + lang + '/css'));
});

gulp.task('compressHtml', () => {
    return gulp.src('html/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist/' + lang + '/html'));
});

gulp.task('copyCompress', () =>
    gulp.src([
        'tmp/appinfo.json'
    ]).pipe(gulp.dest('dist/'+ lang))
);

gulp.task('copyNoCompress', () => {
    return gulp.src([
        'tmp/appinfo.json',
    ]).pipe(gulp.dest('dist/'+ lang))
});

gulp.task('copyAppIconsToDist', () => {
    var p1 = gulp.src([
        'icons/' + appIconBig
    ]).pipe(rename('tv7icon_130x130.png')).pipe(gulp.dest('dist/' + lang))

    var p2 = gulp.src([
        'icons/' + appIconSmall
    ]).pipe(rename('tv7icon_80x80.png')).pipe(gulp.dest('dist/' + lang))

    return merge(p1, p2);
});

gulp.task('build', (cb) => {
    const buildCommand = 'ares-package -o dist/' + lang + '/OutputIPK dist/' + lang;
    console.log('Build command: ', buildCommand);
    execSync(buildCommand);

    cb();
});

gulp.task('run', (cb) => {
    const installCommand = 'ares-install --device emulator dist/' + lang + '/OutputIPK/' + localeData.appInfoId + '_' +
        localeData.appInfoVersion + '_all.ipk';
    console.log('Install command: ', installCommand);
    execSync(installCommand);

    const launchCommand = 'ares-launch --device emulator ' + localeData.appInfoId;
    console.log('Launch command: ', launchCommand);
    execSync(launchCommand);

    cb();
});

loadLocale = ((cb) => {
    console.log('Arguments: ', process.argv);

    lang = process.argv[process.argv.length - 1];

    let split = lang.split('_');
    if (split && split.length === 2) {
        lang = split[1];
    }

    if (lang === 'fi') {
        appIconBig = 'taivas_130x130.png';
        appIconSmall = 'taivas_80x80.png';
        channelImage = 'logo_taivas.png';
        categoryImage = 'category_logo_taivas.png';
        localeData = require('./locale/fi.json');
    }
    else if (lang === 'et') {
        appIconBig = 'taevas_130x130.png';
        appIconSmall = 'taevas_80x80.png';
        channelImage = 'logo_taevas.png';
        categoryImage = 'category_logo_taevas.png';
        localeData = require('./locale/et.json');
    }
    else if (lang === 'sv') {
        appIconBig = 'himlen_130x130.png';
        appIconSmall = 'himlen_80x80.png';
        channelImage = 'logo_himlen.png';
        categoryImage = 'category_logo_himlen.png';
        localeData = require('./locale/sv.json');
    }
    else if (lang === 'ru') {
        appIconBig = 'nebesa_130x130.png';
        appIconSmall = 'nebesa_80x80.png';
        channelImage = 'logo_nebesa.png';
        categoryImage = 'category_logo_nebesa.png';
        localeData = require('./locale/ru.json');
    }

    console.log('Locale data: ', localeData);

    cb();
})

const fi = gulp.series(
    loadLocale, 
    'cleanDist', 
    'cleanTmp',
    'editLocaleFile',
    'copyToDist', 
    'localizeTexts', 
    'copyCompress',
    'copyAppIconsToDist',
    'compressJs',
    'compressCss',
    'compressHtml',
    'cleanTmp',
    'build'
);

const et = gulp.series(
    loadLocale, 
    'cleanDist', 
    'cleanTmp',
    'editLocaleFile',
    'copyToDist', 
    'localizeTexts', 
    'copyCompress',
    'copyAppIconsToDist',
    'compressJs',
    'compressCss',
    'compressHtml',
    'cleanTmp',
    'build'
);

const sv = gulp.series(
    loadLocale, 
    'cleanDist', 
    'cleanTmp',
    'editLocaleFile',
    'copyToDist', 
    'localizeTexts', 
    'copyCompress',
    'copyAppIconsToDist',
    'compressJs',
    'compressCss',
    'compressHtml',
    'cleanTmp',
    'build'
);

const ru = gulp.series(
    loadLocale, 
    'cleanDist', 
    'cleanTmp',
    'editLocaleFile',
    'copyToDist', 
    'localizeTexts', 
    'copyCompress',
    'copyAppIconsToDist',
    'compressJs',
    'compressCss',
    'compressHtml',
    'cleanTmp',
    'build'
);

const run_fi = gulp.series(fi, 'run');
const run_et = gulp.series(et, 'run');
const run_sv = gulp.series(sv, 'run');
const run_ru = gulp.series(ru, 'run');

const uncompress_fi = gulp.series(
    loadLocale, 
    'cleanDist',
    'cleanTmp',
    'editLocaleFile',
    'copyToDist',
    'copyAppIconsToDist',
    'localizeTexts',
    'copyNoCompress',
    'cleanTmp',
    'build'
);

const uncompress_et = gulp.series(
    loadLocale, 
    'cleanDist',
    'cleanTmp',
    'editLocaleFile',
    'copyToDist',
    'copyAppIconsToDist',
    'localizeTexts',
    'copyNoCompress',
    'cleanTmp',
    'build'
);

const uncompress_sv = gulp.series(
    loadLocale, 
    'cleanDist',
    'cleanTmp',
    'editLocaleFile',
    'copyToDist',
    'copyAppIconsToDist',
    'localizeTexts',
    'copyNoCompress',
    'cleanTmp',
    'build'
);

const uncompress_ru = gulp.series(
    loadLocale, 
    'cleanDist',
    'cleanTmp',
    'editLocaleFile',
    'copyToDist',
    'copyAppIconsToDist',
    'localizeTexts',
    'copyNoCompress',
    'cleanTmp',
    'build'
);

exports.fi = fi;
exports.et = et;
exports.sv = sv;
exports.ru = ru;

exports.run_fi = run_fi;
exports.run_et = run_et;
exports.run_sv = run_sv;
exports.run_ru = run_ru;

exports.uncompress_fi = uncompress_fi;
exports.uncompress_et = uncompress_et;
exports.uncompress_sv = uncompress_sv;
exports.uncompress_ru = uncompress_ru;
