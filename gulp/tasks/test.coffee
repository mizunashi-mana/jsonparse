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

  gulp.task 'test:examples', ->
    merge [
      gulp.src [
        paths.test.exampleJs
      ]
      merge [
        gulp.src [
          paths.test.exampleTs
        ]
          .pipe $.data (file) ->
            file.contents = new Buffer file.contents.toString().replace '''
              node_modules/sonparser/lib-typings/sonparser.d.ts
            ''', "#{
              path.relative(path.dirname(file.path), process.cwd())
            }/lib-typings/sonparser.d.ts"
            file
        gulp.src [
          paths.src.libTypings
          paths.dtsm.typings
        ]
      ]
        .pipe $.typescript tsProject
        .js
    ]
      .pipe do $.docsTester
      .pipe $.docsTester.reporter true

  gulp.task 'test', (cb) ->
    $.runSequence 'test:src'
      , 'test:typings'
      , 'test:examples'
      , cb
