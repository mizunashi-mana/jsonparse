module.exports = (gulp, $, conf) ->
  path   = require 'path'
  merge  = require 'merge2'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  tsProject =
    $.typescript.createProject paths.root.tsconf, tsOptions

  gulp.task 'test:src', ->
    gulp.src [
      paths.test.testTs
    ], {read: false}
      .pipe $.mocha
        reporter: process.env.MOCHA_REPORTER or 'nyan'
        require: [
          'ts-node/register'
        ]

  gulp.task 'test:typings', ->
    gulp.src [
      paths.src.libTypings
      paths.test.testTypings
      paths.dtsm.typings
    ]
      .pipe $.typescript tsProject

  gulp.task 'test', (cb) ->
    $.runSequence 'test:src'
      , 'test:typings'
      , cb
