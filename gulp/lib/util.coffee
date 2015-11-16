path = require 'path'
CSON = require 'cson'

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

decorateArgOptions = (argv) ->
  argv.debug      = false if argv.production
  argv.sourcemaps = false if argv.production
  argv.sourcemaps = true if argv.debug

  argv

requireIndex = (pkgname) ->
  if pkgname[0] is '.' or pkgname[0] is '/'
    require pkgname + '/'
  else
    require pkgname

module.exports = {
  requirePathsConf
  requireTsOpts
  requireIndex
  decorateArgOptions
}
