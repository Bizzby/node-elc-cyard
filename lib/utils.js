/**
 * Things without a home yet...
 */
var Map = require('es6-map');

exports.checkFactory = function checkFactory(module, name){

  if (!module.hasOwnProperty("setup")) {
        throw new Error("Factory '" + name + "' is missing the setup function ");
  }
  if (!module.hasOwnProperty("options")) {
        throw new Error("Factory '" + name + "' is missing the options object ");
  }
  if (!module.hasOwnProperty("dependencies")) {
        throw new Error("Factory '" + name + "' is missing the dependencies array ");
  }
}


// TODO remove me and stop using intial array that we
// need this function to convert from
exports.pluginArrayToMap = function pluginArrayToMap(plugins) {

  var pluginMap = new Map();

  plugins.forEach(function(plugin){
    pluginMap.set(plugin.package.name, plugin.factory)
  })

  return pluginMap;
}