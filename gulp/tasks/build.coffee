module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  tsProject =
    $.typescript.createProject paths.tsconf, tsOptions

  gulp.task 'build:doc', ->
    throw Error 'not implement!'

  gulp.task 'build:ts', ->
    reqSMapFilter = $.filter [
      path.relative paths.srcDir.base, pkgInfo.main
    ], {restore: true}

    distMapDir = path.relative paths.distDir.mapDir, paths.distDir.jsDir

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
    ]

  gulp.task 'build', [
    #'build:doc'
    'build:ts'
  ]
