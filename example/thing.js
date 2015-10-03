var tap = require('tap');
var cyard = require('../lib');

var plugins = [
    './plugins/broom',
    './plugins/engine',
    './plugins/car'
];


function onload(err, services){
    console.log('loaded');
    if (err) {
        tap.bailout(err);
    }

    tap.same(services, { 
        engine: 'engine ( 500cc )',
        car: 'I am a car, engine ( 500cc )',
        broom: 'I am a broom' 
    })
}

var opts = {
    env: {
        'ENGINE_SIZE': 500
    }
}

var services = cyard.fabricate(plugins, opts, onload);

