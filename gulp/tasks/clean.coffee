module.exports = (gulp, $, conf) ->
  rimraf = require 'rimraf'
  path   = require 'path'
  runSequence = require 'run-sequence'

  {paths} = conf

  gulp.task 'clean:dist:debug:js', (cb) ->
    rimraf paths.distDir.debug.jsDir, cb

  gulp.task 'clean:dist:debug:dts', (cb) ->
    rimraf paths.distDir.debug.dtsDir, cb

  gulp.task 'clean:dist:debug:map', (cb) ->
    rimraf paths.distDir.debug.mapDir, cb

  gulp.task 'clean:dist:debug', [
    'clean:dist:debug:js'
    'clean:dist:debug:dts'
    'clean:dist:debug:map'
  ], (cb) ->
    rimraf paths.distDir.debug.base, cb

  gulp.task 'clean:dist:prod', (cb) ->
    rimraf paths.distDir.prod.base, cb

  gulp.task 'clean:dist', [
    'clean:dist:debug'
    'clean:dist:prod'
  ]

  gulp.task 'clean:test:map', (cb) ->
    rimraf paths.tests.distDir.mapDir, cb

  gulp.task 'clean:test:dist', (cb) ->
    rimraf paths.tests.distDir.libTests, cb

  gulp.task 'clean:test', [
    'clean:test:map'
    'clean:test:dist'
  ], (cb) ->
    rimraf paths.tests.distDir.base, cb

  gulp.task 'clean:node_modules', (cb) ->
    rimraf 'node_modules', cb

  gulp.task 'clean:dtsm_typings', (cb) ->
    rimraf 'typings', cb

  gulp.task 'clean:pkgs', [
    'clean:node_modules'
    'clean:dtsm_typings'
  ]

  gulp.task 'clean', [
    'clean:dist'
    'clean:test'
  ]

  gulp.task 'remove', [
    'clean'
  ], ->
    $.util.log $.util.colors.red 'You need to run `npm install` after the end of this task!'
    runSequence 'clean:pkgs'
