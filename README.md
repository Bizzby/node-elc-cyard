# CYARD

_short for construction yard_

Something or other for auto wiring up "factories" with configuration and dependencies
and building a dependency graph, and running those factories at runtime.

This is probaly not the dependency injection framework you are looking for... 
_(no really, it isn't, this module is primarily written to help with refactoring a propriatery codebase)

This module is intended to allow your classes/modules/function/files to remain totally
unaware that they are being loaded by, or receiving thier dependencies from `elc-cyard`

## Usage

Basically build up an array of filepaths, where each filepath points to a plugin, throw that list
into `elc-cyard.fabricate(filepaths, callback)` along with a callback. `elc-cyard` will load all the plugins, then calculate a 
build order for the dependencies (or callback an error if thats not possible), then run the plugins in build order,
and once thats finished your callback will called with `(err, stuff)` where stuff is object containing the output
of each plugin, keyed by plugin name.

You can also create a dependency graph for a bunch of plugins by taking the array of filepaths you created above and
calling `elc-cyard.getDependencyGraph(filepaths)` which will return you a (`graphlib.Graph`)[https://github.com/cpettitt/graphlib]. You could probably do something fun like chuck that into graphviz/d3.

You can get all the env strings your dependencies need by calling `elc-cyard.showConfig(filepaths)` which will
return you an array of env strings your app will need



## Concepts
 
### Plugins

Plugins are the main concept of this module. A *plugin* is just NPM module or a folder that could pass off as one.

- a plugin's name is taken from the package.json
- see `./example` for how this works

The plugin should export the following when `require`-ed...

- `options`: an object that follows ['yapec'](https://www.npmjs.com/package/yapec)'s config style.
- `dependencies`: an array of dependencies, where each dependency is a string
- `setup`: a function that should have the following signature `fn(opts, deps, callback)`
    - `opts`: an object containing the values for whatever options you specified
    - `deps`: an object with the requested dependencies
    - `callback`: a function that should be called where the first argument should be an `Error` or `null`, 
        and the second argument should be whatever you wish this plugin provider.



### Options

Options are currently pulled from the enviroment by `yapec`. If your plugin exported the following:

```javascript
exports.options: {
    port: "number",
    name: "string"
}
```

your setup function should expect it's `opts` argument to look like this:

```javascript
{
    port: 8090,
    name: 'api-server'
}
```

### Dependencies

Dependencies are specified by name (as a string). If your plugin requested a dependency called `thing` 
`elc-cyard` will supply whatever the plugin with the name `thing` produced.

e.g

```javascript
exports.dependecies = ['thing'];
```

your setup function should expect it's `deps` argument to look like this:

```javascript
{
    thing: "whatever thing plugin supplied, probably an object"
}
```


## Notes

There is also a `pluginBuilder` to remove the boiler plater from simple factories/plugins.
See comments in './utils/index.js' for more info

- Cyclic dependencies are currently forbidden by this module
- Only supports pulling configuration from the enviroment (but you can work around that with another 'factory')
- This probably won't be useful to you!
- Registering a plugin will also load it, currently can't do one without the other

## TODO
- abstract out configuration fetching / module loading maybe?
- can we accept both pre-loaded plugins and plugin paths, that would be cool
- write some more tests!
- how to protect against plugins/factories not calling 'callback'
- maybe options and dependencies could all go into the package.json?
- maybe `name` could be in the index.js as a fallback

## Internals

```
//This is not really code!


plugin : {
    // the package.json of the 'module'
    package: 
    //the export of the 'module'
    factory: {
        setup: //the function we will run
        options: //object defining what options we need
        dependencies: //what other factories this one depends on
    }
}

```