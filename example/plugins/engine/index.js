exports.dependencies = [];
exports.options = {size: "integer" };
exports.setup = function(opts, deps, callback){
    callback(null, "engine ( " + opts.size +  "cc )")
}