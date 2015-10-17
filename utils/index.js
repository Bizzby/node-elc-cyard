/**
 * Some tools to remove the boiler plate from
 * creating cyard plugins/factorys in standard situations
 */

var SEPARATOR = ':';
var DEPENDENCY_IDENT = 'deps';
var OPTION_IDENT = 'opts';
var PRELOADED_IDENT = 'pre';

var FACTORY_FUNCTION = "function";
var FACTORY_CONSTRUCTOR = "constructor";

/**
 *
 * Use this function when you factory imports a factory function or a class constructor
 * that just accepts dependencies/options as arguments
 * 
 * var pluginBuilder = require('elc-cyard/utils').pluginBuilder;
 * var additionalPaymentControllerFac = require('controllers/AdditionalPayment');
 * var somethingDaft = require('something-daft')
 * args = [
 *   'deps:xyz',
 *   'deps:lala',
 *   somethingDaft,
 *   'opts:boolean:godMode',
 *   'magic-key-is-001'
 * ]
 * module.exports = pluginBuilder(additionalPaymentControllerFac, args)
 *
 * We don't do the requiring ourselves because of the rootpath stuff everywhere
 *
 * TODO:
 * maybe at dev time there could be a switches for
 * - consider (optional) arity checking
 * - consider (optional) missing/null opt/dep checking
 */

/**
 * See docblock above...
 * @param  {string} type   either "constructor" || "function", should we treat module as a function or constructor
 * @param  {[type]} module the module we are going to "build" or whatever
 * @param  {array} args   array of args in a special format (see above for now)
 * @return {object}       return an object that can assigned to module.exports
 */
var pluginBuilder = function(type, module, args){

    // this is the object we will return, it should
    // represent a what cyard expects to find as 'plugin-factory' thing
    var exportables = {}
    
    exportables.dependencies = args.map(mapTypes).filter(filterDeps).map(mapDepNames)

    exportables.options = args.map(mapTypes).filter(filterOps).reduce(reduceOpts, {})

    exportables.setup = function(opts, deps, callback){

        // generate the args array here because we need access to opts/deps
        // provided in this scope 
        var argLikeArray = args.map(mapTypes).map(_argumentMapper)

        // The thing we will return when the plugin is run
        var instance;

        if(type == FACTORY_FUNCTION) {
            instance = module.apply(null, argLikeArray);
        } else if (type == FACTORY_CONSTRUCTOR) {
            instance = construct(module, argLikeArray)
        } else {
            throw new TypeError("type must either " + FACTORY_FUNCTION +" or " + FACTORY_CONSTRUCTOR)
        }

        callback(null, instance);


        function _argumentMapper(argPair, idx){
            
            var arg;

            if(argPair[0] == DEPENDENCY_IDENT) {
                arg = deps[argPair[1]];
            } else if (argPair[0] == OPTION_IDENT) {
                arg = opts[argPair[2]];
            } else if (argPair[0] == PRELOADED_IDENT) {
                arg = argPair[1];
            }

            return arg;

        }

    }

    return exportables;
}

exports.pluginBuilder = pluginBuilder;

//deprecated - use pluginBuilder instead
var factoryBuilder = function(module, args) {
    return pluginBuilder(FACTORY_FUNCTION, module, args);
}
exports.factoryBuilder = factoryBuilder;

//some magic to allow calling apply with new
function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}


// This became a mess quickly..
// we are checking if something is (opts:, deps:, pre:)
// so that we can pass in strings as args and not try to treat
// them as opts or deps. 
function _splittable(arg){
    return (
        typeof arg === 'string' 
        && (
            startsWith(arg, OPTION_IDENT+SEPARATOR ) 
            || 
            startsWith(arg, DEPENDENCY_IDENT+SEPARATOR) 
            ||
            startsWith(arg, PRELOADED_IDENT+SEPARATOR) 
            ) 
        )
}

// we map each arguement to an arg pair
// if we have been passed a non-string we assume thats
// a preloaded 'thing' and prefix it
function mapTypes(arg){
    if (_splittable(arg)) {
        return arg.split(SEPARATOR)
    } else {
        return [PRELOADED_IDENT, arg]
    }

}

function mapDepNames(argPair){
    return argPair[1];
}

function filterDeps(argPair){
    return argPair.length == 2 && argPair[0] == DEPENDENCY_IDENT;
}

function filterOps(argPair){
    return argPair.length >= 2 && argPair[0] == OPTION_IDENT;
}

// this is lame...
function reduceOpts(o, argPair){
    o[ argPair[2] ] = argPair[1]
    return o
}

function startsWith(haystack, needle, position) {
    position = position || 0;
    return haystack.indexOf(needle, position) === position;
  };
