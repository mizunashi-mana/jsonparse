module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'
  extend = require 'extend'

  {
    paths
    tsOptions
    runOptions
    pkgInfo
  } = conf

  tsOpts = extend {}, tsOptions
  tsOpts = extend tsOpts,
    noEmitOnError: true

  tsProject =
    $.typescript.createProject paths.root.tsconf, tsOpts

  gulp.task 'build:doc', ->
    tsConfig = require path.resolve paths.root.tsconf

    gulp.src [
      paths.src.srcTs
      paths.dtsm.typings
    ]
      .pipe $.typedoc
        module: tsConfig.compilerOptions.module
        target: tsConfig.compilerOptions.target
        includeDeclarations: true

        out: paths.dist.typedocDir

        name: pkgInfo.name
        version: true

        ignoreCompilerErrors: false

  gulp.task 'build:debug:js', ->
    gulp.src [
      paths.src.srcJs
      paths.src.srcTypings
    ], {base: paths.src.base}
      .pipe $.if runOptions.sourcemaps
      , do $.sourcemaps.init
      .pipe $.if runOptions.sourcemaps
      , $.sourcemaps.write '.',
        sourceRoot: path.join process.cwd(), 'src'
      .pipe gulp.dest paths.dist.distDir

  gulp.task 'build:debug:ts', ->
    reqSMapFilter = $.filter [
      path.relative paths.src.base, paths.src.index
    ], {restore: true}

    tsResult = gulp.src [
      paths.src.srcTs
      paths.dtsm.typings
    ], {base: paths.src.base}
      .pipe reqSMapFilter
      .pipe $.if runOptions.sourcemaps, $.header '''
        ///<reference path="<%=
          pathModule.relative(pathModule.dirname(file.path), process.cwd())
        %>/typings/source-map-support/source-map-support.d.ts" />
        import * as sourceMapSupport from 'source-map-support';
        sourceMapSupport.install();
      ''', {pathModule: path}
      .pipe reqSMapFilter.restore
      .pipe $.if runOptions.sourcemaps
      , do $.sourcemaps.init
      .pipe $.typescript tsProject

    merge [
      tsResult.dts
      tsResult.js
        .pipe $.if runOptions.sourcemaps
        , $.sourcemaps.write '.',
          sourceRoot: path.join process.cwd(), 'src'
    ]
      .pipe gulp.dest paths.dist.distDir

  gulp.task 'build:prod:js', ->
    gulp.src [
      paths.src.srcJs
      paths.src.srcTypings
    ], {base: paths.src.base}
      .pipe gulp.dest paths.dist.distDir

  gulp.task 'build:prod:ts', ->
    tsResult = gulp.src [
      paths.src.srcTs
      paths.dtsm.typings
    ], {base: paths.src.base}
      .pipe $.typescript tsProject

    merge [
      tsResult.js
      tsResult.dts
    ]
      .pipe gulp.dest paths.dist.distDir

  gulp.task 'build:debug', [
    'build:debug:ts'
    'build:debug:js'
  ]

  gulp.task 'build:prod', [
    'build:prod:ts'
    'build:prod:js'
  ]

  gulp.task 'build'
  ,
    if runOptions.production
      [
        'build:prod'
      ]
    else
      [
        'build:doc'
        'build:debug'
      ]
