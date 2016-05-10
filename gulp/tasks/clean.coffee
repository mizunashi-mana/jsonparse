module.exports = (gulp, $, conf) ->
  del = require 'del'
  path = require 'path'

  {paths} = conf

  gulp.task 'clean:dist', ->
    del [
      paths.dist.distDir
    ]

  gulp.task 'clean:doc', ->
    del [
      paths.dist.typedocDir
    ]

  gulp.task 'clean', [
    'clean:dist'
    'clean:doc'
  ]

  gulp.task 'remove:node_modules', ->
    del [
      'node_modules'
    ]

  gulp.task 'remove:dtsm_typings', (cb) ->
    del [
      paths.dtsm.dir
    ]

  gulp.task 'remove:pkgs', [
    'remove:node_modules'
    'remove:dtsm_typings'
  ]

  gulp.task 'remove', [
    'clean'
  ], (cb) ->
    $.util.log $.util.colors.red '''
      You need to run `npm install` after the end of this task!
    '''
    $.runSequence 'remove:pkgs'
      , cb
