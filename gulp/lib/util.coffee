path = require 'path'
CSON = require 'cson'
extend = require 'extend'

requireConf = (confPath) ->
  CSON.requireFile confPath

requirePathsConf = (confFilePath) ->
  pathsConf = requireConf confFilePath

  pathsConf.dtsm = requireDtsmConf pathsConf.root.dtsmconf

  pathsConf

requireTsOpts = (confFilePath, isDebug = false) ->
  optsConf = requireConf confFilePath

  tsOpts = optsConf.main
  tsOpts.typescript =
    if tsOpts.typescript? is 'pkg'
      require 'typescript'
    else
      undefined

  extend tsOpts
    , if isDebug then optsConf.debug else optsConf.product

  tsOpts

resolveArgOptions = (argv) ->
  argv.debug      = false if argv.production

  argv.sourcemaps = false if argv.production
  argv.sourcemaps = true if argv.debug

  argv

requireDtsmConf = (confPath) ->
  dtsmConf = require path.resolve confPath

  {
    dir: dtsmConf.path
    typings: "#{dtsmConf.path}/*/**/*.d.ts"
  }

module.exports = {
  requireConf
  requirePathsConf
  requireTsOpts
  resolveArgOptions
}
