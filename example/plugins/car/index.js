exports.dependencies = ['engine'];
exports.options = {};
exports.setup = function(options, deps, callback){
     callback(null, "I am a car, " + deps.engine);
}