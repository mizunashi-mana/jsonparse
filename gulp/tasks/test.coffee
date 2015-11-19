module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'
  runSequence = require 'run-sequence'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  tsProject =
    $.typescript.createProject paths.rootconfs.tsconf, tsOptions

  gulp.task 'build:debug:test', [
    'clean:dist:debug:test'
    'build:prod'
  ], ->
    distMapDir = path.relative paths.tests.distDir.debug.base
      , paths.tests.distDir.debug.mapDir

    merge [
      gulp.src [
        paths.tests.srcDir.srcTs
        paths.tests.srcDir.typings
        paths.tests.srcDir.libs
      ], {base: paths.tests.srcDir.base}
        .pipe do $.sourcemaps.init
        .pipe $.typescript tsProject
        .js
        .pipe $.replace 'require("../../lib/")'
          , 'require("../../js/")'
        .pipe $.sourcemaps.write distMapDir
          ,
            sourceRoot: path.join do process.cwd
              , path.basename paths.tests.srcDir.base
        .pipe gulp.dest paths.tests.distDir.debug.base
      gulp.src [
        paths.tests.srcDir.datas
      ], {base: paths.tests.srcDir.base}
        .pipe gulp.dest paths.tests.distDir.debug.base
    ]

  gulp.task 'build:debug:fortest', ['build:debug:test'], (cb) ->
    runSequence 'build:debug'
      , cb

  gulp.task 'build:prod:test', ['clean:test'], ->
    distMapDir = path.relative paths.tests.distDir.prod.base
      , paths.tests.distDir.prod.mapDir

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
        .pipe gulp.dest paths.tests.distDir.prod.base
      gulp.src [
        paths.tests.srcDir.datas
      ], {base: paths.tests.srcDir.base}
        .pipe gulp.dest paths.tests.distDir.prod.base
    ]

  gulpMochaTest = (srcs) ->
    gulp.src srcs, {read: false}
      .pipe $.mocha
        reporter: process.env.MOCHA_REPORTER or 'nyan'
        require: [
          'source-map-support/register'
        ]

  gulp.task 'test:debug:src', ['build:debug:fortest'], ->
    gulpMochaTest [
      paths.tests.distDir.debug.libTests
    ]

  gulp.task 'test:prod:src', ['build:prod:test'], ->
    gulpMochaTest [
      paths.tests.distDir.prod.libTests
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
      .pipe $.replace '"node_modules/sonparser/lib-typings/sonparser.d.ts"'
        , '"../../lib-typings/sonparser.d.ts"'
      .pipe $.typescript tsProject
      .js
      .pipe $.rename {extname: '.ts'}
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

  gulp.task 'test:examples', (cb) ->
    runSequence 'test:examples:js'
      , 'test:examples:ts'
      , cb

  gulp.task 'test', (cb) ->
    if runOptions.production
      runSequence 'test:prod:src'
        , 'test:typings'
        , 'test:examples'
        , cb
    else
      runSequence 'test:debug:src'
        , cb
