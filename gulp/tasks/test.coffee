module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  distMapDir = path.relative paths.testDir.distDir.base
    , paths.testDir.distDir.mapDir

  tsProject =
    $.typescript.createProject paths.tsconf, tsOptions

  convertPath = (path) ->
    if /^test_.*/.test path.basename
      path.basename =
        path.basename.replace /^test_(.*)$/, "test_#{path.extname}_$1"

  gulp.task 'build:test-js', ->
    gulp.src [
      paths.testDir.srcDir.srcJs
    ], {base: paths.testDir.srcDir.base}
      .pipe do $.sourcemaps.init
      .pipe $.rename convertPath
      .pipe $.sourcemaps.write distMapDir
        ,
          sourceRoot: path.join do process.cwd
            , path.basename paths.testDir.srcDir.base
      .pipe gulp.dest paths.testDir.distDir.base

  gulp.task 'build:test-ts', ->
    gulp.src [
      paths.testDir.srcDir.srcTs
      paths.testDir.srcDir.typings
    ], {base: paths.testDir.srcDir.base}
      .pipe do $.sourcemaps.init
      .pipe $.rename convertPath
      .pipe $.typescript tsProject
      .js
      .pipe $.sourcemaps.write distMapDir
        ,
          sourceRoot: path.join do process.cwd
            , path.basename paths.testDir.srcDir.base
      .pipe gulp.dest paths.testDir.distDir.base

  gulp.task 'build:test', ['build:test-js', 'built:test-ts']

  gulpMochaTest = (srcs) ->
    gulp.src srcs, {read: false}
      .pipe $.mocha
        reporter: process.env.MOCHA_REPORTER or 'nyan'
        require: [
          'source-map-support/register'
        ]

  gulp.task 'test:js', ['build:test-js'], ->
    gulpMochaTest [
      paths.testDir.distDir.testJs
    ]

  gulp.task 'test:ts', ['build:test-ts'], ->
    gulpMochaTest [
      paths.testDir.distDir.testTs
    ]

  gulp.task 'test', ->
    runSequence 'test:js', 'test:ts'
