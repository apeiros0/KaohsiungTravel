var gulp = require('gulp'); 
const $ = require('gulp-load-plugins')(); 
var autoprefixer = require('autoprefixer'); 
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');


var envOptions = {
    string: 'env',
    default: { env: 'develop' }
}

var options = minimist(process.argv.slice(2), envOptions);
console.log(options)

// gulp --env {參數} 能帶入 options 設定
// gulp jade --env production


// *******************************
// clean 刪除資料夾
// *******************************
gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], {read: false}) // false阻止gulp讀取文件的內容，使此任務更快
        .pipe($.clean());
});


// *******************************
// 複製檔案 + 資料夾
// *******************************
// 加 ! 不會取得該路徑
gulp.task('copy', function () {
    gulp.src(['./source/**/**', '!source/**/**.html', '!source/**/**.jade','!source/scss/**/**', '!source/js/**/**', '!source/css/**/**'])
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream())
});


// *******************************
// jade
// *******************************
gulp.task('jade', function () {
    // var YOUR_LOCALS = {};

    gulp.src('./source/**/*.jade')
        .pipe($.plumber()) // 出錯時不會停止，會繼續執行 Gulp
        // jade 編譯前取得資料
        // .pipe($.data(function () {
        //     // 使用 require() 載入外部 .json 資料
        //     var khData = require('./source/data/data.json');
        //     var menu = require('./source/data/menu.json');
            
        //     // 合併成物件
        //     var source = {
        //         'khData': khData,
        //         'menu': menu
        //     }
        //     // console.log('jade', source); // 檢查是否有資料載入
        //     return source; // 要回傳物件
        // }))
        .pipe($.jade({
            // locals: YOUR_LOCALS
            pretty: true, // 編譯完的 HTML 將會展開 (沒有壓縮的版本)
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream()); // 自動重新整理
});


// *******************************
// Sass + postCSS
// *******************************
gulp.task('sass', function () {
    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError)) // logError 是 Sass 的延伸套件
        // .pipe($.sass({ 
        //     outputStyle: 'nested', // 輸出方式
        //     includePaths: ['./node_modules/bootstrap/scss']
        //   }) // 取得 node_modules 的 bootstrap.scss
        // 在這個階段已經編譯完成
        .pipe($.postcss([autoprefixer()])) // 搭配 postcss 載入 autoprefixer
        .pipe($.if(options.env === 'production', $.cleanCss())) // 在輸出之前到編譯完成之間，加入 優化程式碼，使用 cleanCss，而非 cleanCSS
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream()); // 自動重新整理
});


// *******************************
// babel(編譯 ES6) + sourcemaps(標註程式碼位置) + concat (合併檔案)
// *******************************
// ES6 不用加 return
gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js')) // 合併檔案 $.concat('合併的檔案名稱')
        .pipe($.if(options.env === 'production', $.uglify({
            compress: {
                drop_console: true, // 清除 console.log
            }
        }))) // 接在合併完檔案 (已編譯完成) 後
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
        .pipe(browserSync.stream()) // 自動重新整理
);


// gulp.task('vendorJs', function () {
//     return gulp.src([ // 從 node_modules 取得 jquery bootstrap 的 js 檔
//       './node_modules/jquery/dist/jquery.slim.min.js',
//       './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
//     ])
//     .pipe($.concat('vendor.js')) // 合併成 vendor.js
//     .pipe(gulp.dest('./public/javascripts'))
//   })


// *******************************
// Browsersync
// *******************************
  gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public/"
        },
        reloadDebounce: 2000
    });
});



// *******************************
// gulp.watch 編譯出錯後，會停止監控
// *******************************
gulp.task('watch', function () {
    $.watch(['./source/**/*.jade', './source/scss/**/*.scss', './source/js/**/*.js'], function () {
        // start 直接呼叫 task
        gulp.start('jade');
        gulp.start('sass');
        gulp.start('babel');
    });
});


// *******************************
// 補充套件: gulp-imagemin
// *******************************
gulp.task('image-min', () =>
    gulp.src('./source/images/*')
        .pipe($.if(options.env === 'production',$.imagemin()))
        .pipe(gulp.dest('./public/images'))
);


// *******************************
// 補充套件: gulp-gh-pages
// *******************************
gulp.task('deploy', function() {
    return gulp.src('./public/**/*') // 發布路徑
      .pipe($.ghPages());
    });


// *******************************
// 合併 task
// *******************************
gulp.task('default', ['jade', 'copy', 'babel', 'sass', 'browser-sync', 'watch']); // 輸入 gulp 後，會依序編譯 ['task1', 'task2', 'task3'] 裡的任務


gulp.task('build', gulpSequence('clean', 'jade', 'babel', 'sass', 'image-min'))


