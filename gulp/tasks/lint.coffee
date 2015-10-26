module.exports = (gulp, $, conf) ->
  merge = require 'merge2'

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
    merge [
      gulp.src [
        paths.srcDir.srcJs
      ]
        .pipe do $.eslint
        .pipe do $.eslint.format
        .pipe do $.eslint.failOnError
      gulp.src [
        paths.docsDir.examples.srcJs
      ]
        .pipe $.header '/* eslint-env es6 *//* eslint no-var: 1 */'
        .pipe do $.eslint
        .pipe do $.eslint.format
        .pipe do $.eslint.failOnError
    ]

  gulp.task 'lint', [
    'lint:gulp'
    # 'lint:config'
    'lint:ts'
    'lint:js'
  ]
