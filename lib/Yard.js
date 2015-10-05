/**
 * Internal class
 */

var path = require('path');
var utils = require('./utils');
var Map = require('es6-map');
var async = require('async');
var yapec = require('yapec');

module.exports = Yard;

function Yard(options){

    opts = options || {};

    //TODO remove me
    this.env = opts.env;
    this._basePath = opts.basePath;
    this._pluginPaths = opts.pluginPaths
    this._pluginRunner = opts.pluginRunner; // a function
    this._pluginLoader = opts.pluginLoader; // a function
    this._graphOps = opts.graphOps; //

}


Yard.prototype.fabricate = function(callback) {

  var self = this;

  // base path is that of the module calling us
  // we use this to resolve relative modules
  var basePath = this.basePath

  //we should check for duplicate names on this!
  var plugins = this._pluginPaths.map(this._mapPluginPathsToPlugins.bind(this));

  // This will dedupe the above implicitly - not great!
  var pluginMap = utils.pluginArrayToMap(plugins);

  try {
    this._checkFactories(pluginMap);
  } catch (err) {
    // FIXME: catch validation errors etc
    throw err;
  }

  var dependencyGraph = this._graphOps.createDependecyGraph(pluginMap);

  try {
    this._graphOps.checkDependecyGraph(dependencyGraph);
  } catch (err) {
    // FIXME: blah blah
    throw err;
  }

  try {
    this._graphOps.checkForImplicitDependencies(dependencyGraph, pluginMap);
  } catch (err) {
    // FIXME: blah blah
    throw err;
  }

  var runOrder = this._graphOps.generateRunOrder(dependencyGraph);

  this.runPlugins(runOrder, pluginMap, _onComplete);

  function _onComplete(err, pluginOutputs){
    if(err){
      return callback(err);
    }

    // stupid map -> obj because it's probably not fair
    // to expect userland to deal with an es6 map yet
    var retval = {}

    pluginOutputs.forEach(function(val, key){
      retval[key] = val
    })

    return callback(null, retval);

  }
}

/**
 * Generates the ENV VAR strings for the plugins
 * 
 * @return {[type]} [description]
 */
Yard.prototype.generateEnvConfig =function(){

  var self = this;

  //we should check for duplicate names on this!
  var plugins = this._pluginPaths.map(this._mapPluginPathsToPlugins.bind(this));

  // This will dedupe the above implicitly - not great!
  var pluginMap = utils.pluginArrayToMap(plugins);

  var enviromentStrings = []

  pluginMap.forEach(function(plugin, pluginName){

    if (Object.keys(plugin.options).length > 0) {
        var configSpec = self.generateConfigSpec(pluginName, plugin);
        yapec.getEnvStrings(configSpec.prefix, configSpec.spec).forEach(function(str){
            enviromentStrings.push(str)
        });
    }

  })

  return enviromentStrings;

}

/**
 * Yucky API to allow having fun with the internal graphlib graph we use
 * @return {graphlib.Graph} [description]
 */
Yard.prototype.getDependencyGraph = function() {

  var plugins = this._pluginPaths.map(this._mapPluginPathsToPlugins.bind(this));

  // This will dedupe the above implicitly - not great!
  var pluginMap = utils.pluginArrayToMap(plugins);

  var dependencyGraph = this._graphOps.createDependecyGraph(pluginMap);

  return dependencyGraph

};

Yard.prototype.runPlugins = function(order, plugins, callback) {

  var self = this;
  //for now run plugins in series and don't attempt anything smart

  var pluginOutput = new Map();  

  async.eachSeries(order, _runFactory, _runFinish);


  function _runFinish(err) {
    if(err) {
      //log/whatever the error
      return callback(err)
    }
    return callback(null, pluginOutput);
  }

  function _runFactory(pluginName, cb){

    var config = {};
    var factory = plugins.get(pluginName);

    // This is fugly and brittle....
    if (Object.keys(factory.options).length > 0) {
      var configSpec = self.generateConfigSpec(pluginName, factory);
      config = yapec(configSpec.prefix, configSpec.spec, self.env, configSpec.opts);
    }
    //only supply asked for services
    //TODO: maybe this needs context binding
    var deps = factory.dependencies.reduce(_depReduce, {});

    //TODO: should we explicity context bind `this` to null here
    //TODO: should we try/catch this?
    factory.setup(config, deps, _onSetupComplete)

    function _onSetupComplete(err, output){
      if(err) {
        return cb(err);
      }
      pluginOutput.set(pluginName, output);
      return cb()
    }

    function _depReduce(initVal, depName){
      initVal[depName] = pluginOutput.get(depName);
      return initVal
    }

  }
}

Yard.prototype.generateConfigSpec = function(name, module) {

  // We are using yapec style conventions in the factories right now
  // we need to think what we do for non env var configuration

  var configSpec = {
    name: name,
    prefix: name.toUpperCase() + '_',
    opts: {
      ignoreMissing: true
    },
    spec: module.options
  }

  return configSpec;

}

Yard.prototype._checkFactories = function(factories) {
  factories.forEach(utils.checkFactory);
}


Yard.prototype._mapPluginPathsToPlugins = function(pluginPath) {
    return this._pluginLoader(this._basePath, pluginPath)
};
