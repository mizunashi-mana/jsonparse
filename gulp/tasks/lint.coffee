module.exports = (gulp, $, conf) ->
  merge = require 'merge2'
  runSequence = require 'run-sequence'

  {paths} = conf

  gulp.task 'lint:gulp:coffee', ->
    gulp.src [
      paths.gulp.file
      paths.gulp.tasks
    ]
      .pipe do $.coffeelint
      .pipe do $.coffeelint.reporter
      .pipe $.coffeelint.reporter 'fail'

  gulp.task 'lint:gulp:js', ->
    gulp.src [
      paths.gulp.libDir.srcJs
      "!#{paths.gulp.libDir.isrcJs}"
    ]
      .pipe do $.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failAfterError

  gulp.task 'lint:gulp', (cb) ->
    runSequence 'lint:gulp:coffee'
      , 'lint:gulp:js'
      , cb

  gulp.task 'lint:config', ->
    throw new Error 'not implement!'

  gulp.task 'lint:docs:ts', ->
    gulp.src [
      paths.docsDir.examples.srcTs
    ]
      .pipe do $.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint:docs:js', ->
    gulp.src [
      paths.docsDir.examples.srcJs
    ]
      .pipe $.header '/* eslint-disable vars-on-top */'
      .pipe do $.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failAfterError

  gulp.task 'lint:docs', (cb) ->
    runSequence 'lint:docs:ts'
      , 'lint:docs:js'
      , cb

  gulp.task 'lint:src:ts', ->
    gulp.src [
      paths.srcDir.srcTs
      paths.tests.srcDir.srcTs
      paths.srcDir.libTypings
    ]
      .pipe do $.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint:src:js', ->
    gulp.src [
      paths.srcDir.srcJs
    ]
      .pipe do $.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failAfterError

  gulp.task 'lint:src', (cb) ->
    runSequence 'lint:src:ts'
      , 'lint:src:js'
      , cb

  gulp.task 'lint', (cb) ->
    runSequence 'lint:gulp'
      #, 'lint:config'
      , 'lint:docs'
      , 'lint:src'
      , cb
