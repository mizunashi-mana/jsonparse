module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  distMapDir = path.relative paths.distDir.mapDir, paths.distDir.jsDir

  tsProject =
    $.typescript.createProject paths.tsconf, tsOptions

  gulp.task 'build:doc', ->
    throw Error 'not implement!'

  gulp.task 'build:ts', ->
    reqSMapFilter = $.filter [
      path.relative paths.srcDir.base, pkgInfo.main
    ], {restore: true}

    tsResult = gulp.src [
      paths.srcDir.srcTs
      paths.srcDir.typings
    ], {base: paths.srcDir.base}
      .pipe reqSMapFilter
      .pipe $.if runOptions.sourcemaps, $.header '''
        ///<reference path="<%=
          pathModule.relative(pathModule.dirname(file.path), process.cwd())
        %>/typings/source-map-support/source-map-support.d.ts" />
        import * as sourceMapSupport from "source-map-support";
        sourceMapSupport.install();
      ''', {pathModule: path}
      .pipe reqSMapFilter.restore
      .pipe $.if runOptions.sourcemaps, do $.sourcemaps.init
      .pipe $.typescript tsProject

    merge [
      tsResult.dts
        .pipe gulp.dest paths.distDir.dtsDir
      tsResult.js
        .pipe $.if runOptions.sourcemaps
        , $.sourcemaps.write distMapDir
          ,
            sourceRoot: path.join process.cwd(), 'src'
        .pipe gulp.dest paths.distDir.jsDir
    ]

  gulp.task 'build:tjs', ['build:ts'], ->
    jsFilter = $.filter [
      '**/*.js'
    ], {restore: true, passthrough: false}

    dtsFilter = $.filter [
      '**/*.d.ts'
    ]

    writeSourceMap = (streamSrc) ->
      streamSrc
        .pipe $.if runOptions.sourcemaps, do $.sourcemaps.init
        .pipe $.if runOptions.sourcemaps
        , $.sourcemaps.write distMapDir
          ,
            sourceRoot: path.join do process.cwd, 'src'

    jsStream = merge [
      gulp.src [
        paths.srcDir.srcJs
        paths.srcDir.srcDts
      ], {base: paths.srcDir.base}
      gulp.src [
        paths.srcDir.typings
      ], {base: do process.cwd}
    ]
      .pipe jsFilter

    dtsStream = jsFilter.restore
      .pipe dtsFilter

    merge [
      writeSourceMap jsStream
        .pipe gulp.dest paths.distDir.jsDir
      writeSourceMap dtsStream
        .pipe gulp.dest paths.distDir.dtsDir
    ]

  gulp.task 'build', [
    #'build:doc'
    'build:tjs'
  ]
