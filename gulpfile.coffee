gulp        = require 'gulp'
gulpPlugins = do require 'gulp-load-plugins'
gulpPlugins.runSequence = require 'run-sequence'

path = require 'path'
{argv} = require 'yargs'

# resolve gulp settings
myGulpUtil = require './gulp/lib/util'
pathsConf = myGulpUtil.requirePathsConf './gulp/conf/path.cson'
argOptions = myGulpUtil.resolveArgOptions argv

gulpConf =
  paths: pathsConf
  tsOptions: myGulpUtil
    .requireTsOpts pathsConf.gulp.tsopts, argOptions.debug
  runOptions: argOptions
  pkgInfo: require './package.json'

# require tasks
gulpPlugins.docsTester =
  require './gulp/lib/gulp-docs-tester/'

requireTask = (taskname) ->
  taskReq = require path.resolve './gulp/tasks', taskname
  taskReq gulp, gulpPlugins, gulpConf

requireTask 'lint'
requireTask 'build'
requireTask 'test'
requireTask 'clean'

gulp.task 'default', ['build']
