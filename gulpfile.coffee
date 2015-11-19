gulp = require 'gulp'
gulpPlugins = do require 'gulp-load-plugins'

path = require 'path'
{argv} = require 'yargs'

gulpDir = './gulp'

gulpLibDir = path.resolve gulpDir, 'lib'
gulpConfDir = path.resolve gulpDir, 'conf'
pathsConfPath = path.resolve gulpConfDir, 'paths.cson'
tsoptsConfPath = path.resolve gulpConfDir, 'tsopts.cson'

{
  requirePathsConf
  requireTsOpts
  requireIndex
  decorateArgOptions
} = require path.resolve gulpLibDir, 'util'

conf =
  paths      : requirePathsConf pathsConfPath
  tsOptions  : requireTsOpts tsoptsConfPath
  runOptions : decorateArgOptions argv
  pkgInfo    : require './package.json'

gulpPlugins.replace =
  requireIndex path.resolve gulpLibDir, 'gulp-replace-ex'
gulpPlugins.jstester =
  requireIndex path.resolve gulpLibDir, 'gulp-jstester'

requireTask = (taskname) ->
  taskReq = require path.resolve gulpDir, 'tasks/' + taskname
  taskReq gulp, gulpPlugins, conf

requireTask 'lint'
requireTask 'build'
requireTask 'test'
requireTask 'clean'

gulp.task 'default', ['build']
