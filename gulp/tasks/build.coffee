module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'
  runSequence = require 'run-sequence'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  distMapDir = path.relative paths.distDir.debug.jsDir
    , paths.distDir.debug.mapDir

  tsProject =
    $.typescript.createProject paths.rootconfs.tsconf, tsOptions

  gulp.task 'build:doc', ->
    tsConfig = require paths.rootconfs.tsconf

    gulp.src [
      paths.srcDir.srcTs
      paths.srcDir.srcDts
    ]
      .pipe $.typedoc
        module: tsConfig.compilerOptions.module
        target: tsConfig.compilerOptions.target
        includeDeclarations: true
        out: paths.docsDir.distDir.refsDir
        name: pkgInfo.name
        version: true
        verbose: true

  gulp.task 'build:debug:ts', ->
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

  gulp.task 'build:debug:typings', ->
    merge [
      gulp.src [
        paths.srcDir.srcDts
      ], {base: paths.srcDir.base}
        .pipe gulp.dest paths.distDir.debug.dtsDir
      gulp.src [
        paths.srcDir.typings
      ], {base: do process.cwd}
        .pipe gulp.dest paths.distDir.debug.base
    ]

  gulp.task 'build:debug:js', ->
    gulp.src [
      paths.srcDir.srcJs
    ], {base: paths.srcDir.base}
      .pipe $.if runOptions.sourcemaps
      , do $.sourcemaps.init
      .pipe $.header ''
      .pipe $.if runOptions.sourcemaps
      , $.sourcemaps.write distMapDir
        ,
          sourceRoot: path.join do process.cwd, 'src'
      .pipe gulp.dest paths.distDir.debug.jsDir

  gulp.task 'build:debug', ->
    runSequence 'build:debug:ts'
      , [
        'build:debug:typings'
        'build:debug:js'
      ]

  gulp.task 'build:prod:ts', ->
    tsResult = gulp.src [
      paths.srcDir.srcTs
      paths.srcDir.typings
    ], {base: paths.srcDir.base}
      .pipe $.typescript tsProject

    merge [
      tsResult.dts
      tsResult.js
    ]
      .pipe gulp.dest paths.distDir.prod.base

  gulp.task 'build:prod:typings', ->
    gulp.src [
      paths.srcDir.srcDts
    ], {base: paths.srcDir.base}
      .pipe gulp.dest paths.distDir.prod.base

  gulp.task 'build:prod:js', ->
    gulp.src [
      paths.srcDir.srcJs
    ], {base: paths.srcDir.base}
      .pipe gulp.dest paths.distDir.prod.base

  gulp.task 'build:prod', ->
    runSequence 'build:prod:ts'
      , [
        'build:prod:typings'
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
