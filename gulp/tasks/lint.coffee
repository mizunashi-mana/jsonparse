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

  gulp.task 'lint:gulp', ->
    runSequence 'lint:gulp:coffee'
      , 'lint:gulp:js'

  gulp.task 'lint:config', ->
    throw new Error 'not implement!'

  gulp.task 'lint:ts', ->
    gulp.src [
      paths.srcDir.srcTs
      paths.testDir.srcDir.srcTs
    ]
      .pipe do $.tslint
      .pipe $.tslint.report 'verbose'
    gulp.src [
      paths.docsDir.examples.srcTs
    ]
      .pipe do $.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint:js', ->
    merge [
      gulp.src [
        paths.srcDir.srcJs
      ]
        .pipe do $.eslint
        .pipe do $.eslint.format
        .pipe do $.eslint.failAfterError
      gulp.src [
        paths.docsDir.examples.srcJs
      ]
        .pipe $.header '/* eslint-disable vars-on-top */'
        .pipe do $.eslint
        .pipe do $.eslint.format
        .pipe do $.eslint.failAfterError
    ]

  gulp.task 'lint:typing', ->
    gulp.src [
      paths.libTyping
    ]
      .pipe do $.tslint
      .pipe $.tslint.report 'verbose'

  gulp.task 'lint', ->
    runSequence 'lint:gulp'
      #, 'lint:config'
      , 'lint:ts'
      , 'lint:js'
      , 'lint:typing'
