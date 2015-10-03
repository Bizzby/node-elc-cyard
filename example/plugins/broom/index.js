exports.dependencies = [];
exports.options = {};
exports.setup = function(options, deps, callback){

    //Simulate some async stuff
    setImmediate(function(){
        callback(null, "I am a broom")
    })
}