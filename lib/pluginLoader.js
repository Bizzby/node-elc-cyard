var path = require('path');

/**
 * loads a plugin
 * @param  {string} base       [the base path (most likely the directory of the userland code that called this lib)]
 * @param  {string} pluginPath [the path to the plugin folder]
 * @return {[type]}            [a "plugin" object]
 */
module.exports = function loadPlugin(base, pluginPath){

  //for now all modules are relative and not in npm
  var modulePath = path.resolve(base, pluginPath);
  var packagePath = path.resolve(base, pluginPath, 'package.json');

  //Our internal concept of a module/plugin/thing
  return {
    factory: require(modulePath),
    package: require(packagePath)
  };

}