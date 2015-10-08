module.exports = (gulp, $, conf) ->
  path   = require 'path'

  {paths, tsOptions, runOptions, pkgInfo} = conf

  distMapDir = path.relative paths.testDir.distDir.base
    , paths.testDir.distDir.mapDir

  tsProject =
    $.typescript.createProject paths.tsconf, tsOptions

  gulp.task 'build:test', ['clean:test'], ->
    gulp.src [
      paths.testDir.srcDir.srcTs
      paths.testDir.srcDir.typings
      paths.testDir.srcDir.libs
    ], {base: paths.testDir.srcDir.base}
      .pipe do $.sourcemaps.init
      .pipe $.typescript tsProject
      .js
      .pipe $.sourcemaps.write distMapDir
        ,
          sourceRoot: path.join do process.cwd
            , path.basename paths.testDir.srcDir.base
      .pipe gulp.dest paths.testDir.distDir.base

  gulpMochaTest = (srcs) ->
    gulp.src srcs, {read: false}
      .pipe $.mocha
        reporter: process.env.MOCHA_REPORTER or 'nyan'
        require: [
          'source-map-support/register'
        ]

  gulp.task 'test', ['build:test'], ->
    gulpMochaTest [
      paths.testDir.distDir.testTs
    ]
