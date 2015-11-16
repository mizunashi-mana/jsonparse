module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'
  runSequence = require 'run-sequence'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  distMapDir = path.relative paths.tests.distDir.base
    , paths.tests.distDir.mapDir

  tsProject =
    $.typescript.createProject paths.rootconfs.tsconf, tsOptions

  gulp.task 'build:test', ['clean:test'], ->
    merge [
      gulp.src [
        paths.tests.srcDir.srcTs
        paths.tests.srcDir.typings
        paths.tests.srcDir.libs
      ], {base: paths.tests.srcDir.base}
        .pipe do $.sourcemaps.init
        .pipe $.typescript tsProject
        .js
        .pipe $.sourcemaps.write distMapDir
          ,
            sourceRoot: path.join do process.cwd
              , path.basename paths.tests.srcDir.base
        .pipe gulp.dest paths.tests.distDir.base
      gulp.src [
        paths.tests.srcDir.datas
      ], {base: paths.tests.srcDir.base}
        .pipe gulp.dest paths.tests.distDir.base
    ]

  gulpMochaTest = (srcs) ->
    gulp.src srcs, {read: false}
      .pipe $.mocha
        reporter: process.env.MOCHA_REPORTER or 'nyan'
        require: [
          'source-map-support/register'
        ]

  gulp.task 'test:src', ['build:test'], ->
    gulpMochaTest [
      paths.tests.distDir.libTests
    ]

  gulp.task 'test:typings', ->
    gulp.src [
      paths.srcDir.libTypings
      paths.tests.srcDir.typingTests
      paths.tests.srcDir.typings
    ]
      .pipe $.typescript tsProject

  gulp.task 'test:examples:js', ->
    gulp.src [
      paths.docsDir.examples.srcJs
    ]
      .pipe $.replace 'require("sonparser")', '''
        require(require("path").join(
          require("path").relative(___dirname, process.cwd()),
          "lib/"
        ))
      '''
      .pipe $.replace 'console.log', '(function(){})'
      .pipe $.header '"use strict";'
      .pipe do $.jstester
      .pipe $.jstester.reporter true

  gulp.task 'test:examples:ts', ->
    gulp.src [
      paths.docsDir.examples.srcTs
      paths.srcDir.libTypings
      paths.tests.srcDir.typings
    ]
      .pipe $.typescript tsProject

  gulp.task 'test:examples', ->
    runSequence 'test:examples:js'
      , 'test:examples:ts'

  gulp.task 'test', (cb) ->
    runSequence 'test:src'
      , 'test:typings'
      , 'test:examples'
      , cb
