gulp = require 'gulp'
gulpPlugins = do require 'gulp-load-plugins'

CSON = require 'cson'
path = require 'path'
argv = (require 'yargs').argv

pkg = require './package.json'
gulpDir = './gulp'

requirePathsConf = (confFilePath) ->
  pathsConf = CSON.requireFile confFilePath
  parsePaths = (obj, base) ->
    if typeof obj is 'string'
      if base?
        path.resolve base, obj
      else
        path.resolve obj
    else
      ret = {}
      baseDir =
        if obj.base?
          parsePaths obj.base, base
        else
          base
      for key, pathsObj of obj
        ret[key] =
          unless key is 'base'
            parsePaths pathsObj, baseDir
          else
            baseDir
      ret

  parsePaths pathsConf

requireTsOpts = (confFilePath) ->
  optsConf = CSON.requireFile confFilePath
  if optsConf.typescript? is 'pkg'
    optsConf.typescript = require 'typescript'
  else
    optsConf.typescript = undefined

  optsConf

argv.debug      = false if argv.production
argv.sourcemaps = false if argv.production
argv.sourcemaps = true if argv.debug

gulpConfDir = path.resolve gulpDir, 'conf'

conf =
  paths      : requirePathsConf path.resolve gulpConfDir, 'paths.cson'
  tsOptions  : requireTsOpts path.resolve gulpConfDir, 'tsopts.cson'
  runOptions : argv
  pkgInfo    : pkg

requireTask = (taskname) ->
  taskReq = require path.resolve gulpDir, 'tasks/' + taskname
  taskReq gulp, gulpPlugins, conf

requireTask 'lint'
requireTask 'build'
requireTask 'test'
requireTask 'clean'

gulp.task 'default', ['build']
