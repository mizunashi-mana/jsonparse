module.exports = (gulp, $, conf) ->
  {paths} = conf

  gulp.task 'lint:gulp', ->
    gulp.src [
      paths.gulp.file
      paths.gulp.tasks
    ]
      .pipe do $.coffeelint
      .pipe do $.coffeelint.reporter
      .pipe $.coffeelint.reporter 'fail'

  gulp.task 'lint:config', ->
    throw new Error 'not implement!'

  gulp.task 'lint:ts', ->
    gulp.src [
      paths.srcDir.srcTs
      paths.testDir.srcDir.srcTs
    ]
      .pipe do $.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint:js', ->
    gulp.src [
      paths.srcDir.srcJs
    ]
      .pipe do $.eslint
      .pipe do $.eslint.format
      .pipe do $.eslint.failOnError

  gulp.task 'lint', [
    'lint:gulp'
    # 'lint:config'
    'lint:ts'
    'lint:js'
  ]
