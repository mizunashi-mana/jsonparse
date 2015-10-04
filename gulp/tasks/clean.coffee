module.exports = (gulp, $, conf) ->
  rimraf = require 'rimraf'
  path   = require 'path'

  {paths} = conf

  gulp.task 'clean:distJs', (cb) ->
    rimraf paths.distDir.jsDir, cb

  gulp.task 'clean:distDts', (cb) ->
    rimraf paths.distDir.dtsDir, cb

  gulp.task 'clean:distMap', (cb) ->
    rimraf paths.distDir.mapDir, cb

  gulp.task 'clean:dist', [
    'clean:distJs'
    'clean:distDts'
    'clean:distMap'
  ], (cb) ->
    rimraf paths.distDir.base, cb

  gulp.task 'clean', [
    'clean:dist'
  ]
