/**
 * Some sort of automagical thing
 * for loading up factories and supplying them with
 * configuration and dependencies
 */

var path = require('path');
var yapec = require('yapec');

var Map = require('es6-map');

// Not sure how this ended up a class...
var GraphOps = require('./graphOps');
var Yard = require('./Yard');

var pluginLoader = require('./pluginLoader');


/**
 * Takes an array of (relative) pluginPaths and returns the output of those plugins
 * as object
 * @param  {[type]}   pluginPaths [description]
 * @param  {[type]}   options     [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
exports.fabricate = function(pluginPaths, options, callback){

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // Opts is basically here for hacking things in
  // for now
  var opts = options || {};

  var graphOps = new GraphOps();

  // base path is that of the module calling us
  // we use this to resolve relative modules
  var basePath = path.dirname(module.parent.filename);

  var yard = new Yard({
    env: opts.env || process.env,
    basePath: basePath,
    pluginPaths: pluginPaths,
    pluginLoader: pluginLoader,
    graphOps: graphOps
  })

  yard.fabricate(callback)

}

exports.showConfig = function(pluginPaths, options){

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // Opts is basically here for hacking things in
  // for now
  var opts = options || {};

  var graphOps = new GraphOps();

  // base path is that of the module calling us
  // we use this to resolve relative modules
  var basePath = path.dirname(module.parent.filename);

  var yard = new Yard({
    env: opts.env || process.env,
    basePath: basePath,
    pluginPaths: pluginPaths,
    pluginLoader: pluginLoader,
    graphOps: graphOps
  })

  return yard.generateEnvConfig()

}







