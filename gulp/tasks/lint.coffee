module.exports = (gulp, $, conf) ->
  merge = require 'merge2'

  {paths} = conf

  gulp.task 'lint:gulp:coffee', ->
    gulp.src [
      paths.gulp.main
      paths.gulp.tasks
      paths.gulp.srcCoffee
    ]
      .pipe $.coffeelint paths.lint.coffeelint
      .pipe do $.coffeelint.reporter
      .pipe $.coffeelint.reporter 'fail'

  gulp.task 'lint:gulp:js', ->
    gulp.src [
      paths.gulp.srcJs
    ]
      .pipe $.eslint paths.lint.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failAfterError

  gulp.task 'lint:gulp', (cb) ->
    $.runSequence 'lint:gulp:coffee'
      , 'lint:gulp:js'
      , cb

  gulp.task 'lint:config', ->
    throw new Error 'not implement!'

  gulp.task 'lint:docs:ts', ->
    gulp.src [
      paths.test.exampleTs
    ]
      .pipe $.tslint
        configuration: paths.lint.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint:docs:js', ->
    gulp.src [
      paths.test.exampleJs
    ]
      .pipe $.eslint paths.lint.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failAfterError

  gulp.task 'lint:docs', (cb) ->
    $.runSequence 'lint:docs:ts'
      , 'lint:docs:js'
      , cb

  gulp.task 'lint:src:ts', ->
    gulp.src [
      paths.src.srcTs
      paths.test.srcTestTs
      paths.src.libTypings
    ]
      .pipe $.tslint
        configuration: paths.lint.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint:src:js', ->
    gulp.src [
      paths.src.srcJs
    ]
      .pipe $.eslint paths.lint.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failAfterError

  gulp.task 'lint:src', (cb) ->
    $.runSequence 'lint:src:ts'
      , 'lint:src:js'
      , cb

  gulp.task 'lint', (cb) ->
    $.runSequence 'lint:gulp'
      #, 'lint:config'
      , 'lint:docs'
      , 'lint:src'
      , cb
