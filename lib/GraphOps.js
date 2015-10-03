/**
 * Not actually representing a dependency graph, just has some operations
 * that relate to dependency graphs - also so totally tied to this lib
 */

var graphlib = require("graphlib");

module.exports = GraphOps;

function GraphOps(){

}

/**
 * creates a dependencyGraph
 * @param  {Map} plugins [description]
 * @return {[type]}         [description]
 */
GraphOps.prototype.createDependecyGraph = function(plugins) {

  var depGraph = new graphlib.Graph({ directed: true });

  plugins.forEach(_addNode);
  plugins.forEach(_addEdge);

  return depGraph;

  function _addNode(module, name){
      depGraph.setNode(name)
  }

  function _addEdge(module, name){
    function _reallyAddEdge(dep){
      depGraph.setEdge(name, dep);
    }

    module.dependencies.forEach(_reallyAddEdge)
  }

}

/**
 * [checkForImplicitDependencies description]
 * @param  {[type]} depGraph  [description]
 * @param  {Map} factories [description]
 * @return {[type]}           [description]
 */
GraphOps.prototype.checkForImplicitDependencies = function(depGraph, factories) {

  var moduleList = depGraph.nodes();

  var implicitDeps = moduleList.filter(_depFilter);

  if(implicitDeps.length > 0) {
    throw new Error('Implicit dependencies discovered: ' + implicitDeps.join(', '))
  }

  function _depFilter(dep){
    return (factories.has(dep) === false)
  }

}

/**
 * [generateRunOrder description]
 * @param  {[type]} depGraph [description]
 * @return {[type]}          [description]
 */
GraphOps.prototype.generateRunOrder = function(depGraph) {
  // FIXME: Maybe one day we could something smart and return seperate components
  return graphlib.alg.topsort(depGraph).reverse();

}

GraphOps.prototype.checkDependecyGraph = function(depGraph) {

  // Check if acylic (this test is faster than looking for actual cycles)
  if(graphlib.alg.isAcyclic(depGraph) === false) {

    // Find some cycles and throw an error
    var cycles = graphlib.alg.findCycles(depGraph);

    throw new Error('Dependency Cycles Found: '+ cycles.map(_serialiseCycle).join(','));
  }

}

function _serialiseCycle(cycleArray){
  return cycleArray.join(' -> ');
}