module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  distMapDir = path.relative paths.distDir.debug.jsDir
    , paths.distDir.debug.mapDir

  tsProject =
    $.typescript.createProject paths.tsconf, tsOptions

  gulp.task 'build:doc', ->
    throw new Error 'not implement!'

  gulp.task 'build:ts', ->
    reqSMapFilter = $.filter [
      path.relative paths.srcDir.base, paths.srcDir.srcIndex
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
      .pipe $.if runOptions.sourcemaps
      , do $.sourcemaps.init
      .pipe $.typescript tsProject

    if runOptions.production
      merge [
        tsResult.dts
        tsResult.js
      ]
        .pipe gulp.dest paths.distDir.prod.base
    else
      merge [
        tsResult.dts
          .pipe gulp.dest paths.distDir.debug.dtsDir
        tsResult.js
          .pipe $.if runOptions.sourcemaps
          , $.sourcemaps.write distMapDir
            ,
              sourceRoot: path.join process.cwd(), 'src'
          .pipe gulp.dest paths.distDir.debug.jsDir
      ]

  gulp.task 'build:tjs', ['build:ts'], ->
    jsFilter = $.filter [
      '**/*.js'
    ], {restore: true, passthrough: false}

    dtsFilter = $.filter [
      '**/*.d.ts'
    ]

    jsStream = merge [
      gulp.src [
        paths.srcDir.srcJs
        paths.srcDir.srcDts
      ], {base: paths.srcDir.base}
    ]
      .pipe jsFilter

    dtsStream = jsFilter.restore
      .pipe dtsFilter

    if runOptions.production
      merge [
        dtsStream
        jsStream
      ]
        .pipe gulp.dest paths.distDir.prod.base
    else
      merge [
        jsStream
          .pipe $.if runOptions.sourcemaps
          , do $.sourcemaps.init
          .pipe $.header ''
          .pipe $.if runOptions.sourcemaps
          , $.sourcemaps.write distMapDir
            ,
              sourceRoot: path.join do process.cwd, 'src'
          .pipe gulp.dest paths.distDir.debug.jsDir
        dtsStream
          .pipe gulp.dest paths.distDir.debug.dtsDir
        gulp.src [
          paths.srcDir.typings
        ], {base: do process.cwd}
          .pipe gulp.dest paths.distDir.debug.base
      ]

  gulp.task 'build', [
    #'build:doc'
    'build:tjs'
  ]
