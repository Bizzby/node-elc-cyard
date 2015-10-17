# CYARD

_short for construction yard_

Something or other for auto wiring up "factories" with configuration and dependencies
and building a dependency graph, and running those factories at runtime.

This is probaly not the dependency injection framework you are looking for... (no really, it isn't)

## Usage

- a "plugin" is just NPM module or a folder that could pass off as one.
- a plugin's name is taken from the package.json
- see './example' for how this works

There is also a `pluginBuilder` to remove the boiler plater from simple factories/plugins.
See comments in './utils/index.js' for more info




## Notes

- Cyclic dependencies are forbidden by this module
- Only supports pulling configuration from the enviroment (but you can work around that with another 'factory')
- This probably won't be useful to you!

## TODO

- abstract out configuration fetching / module loading maybe?
- can we accept both pre-loaded plugins and plugin paths, that would be cool
- write some more tests!
- how to protect against plugins/factories not calling 'callback'
- maybe options and dependencies could all go into the package.json?


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