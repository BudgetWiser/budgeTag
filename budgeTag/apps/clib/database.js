var express = require('express'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    tagModel = require('../tag/model');

mongoose.connect('mongodb://localhost/budgeTag');

var Service = tagModel.Service;

var services = JSON.parse(fs.readFileSync(__dirname + '/data/services.json', 'utf8'));

var p = 0, complete = services.length;

services.map(function(s){
    var service = new Service({
        name: s.name,
        sum: [s.sum, s._sum],
        categories: s.categories
    });

    service.save(function(err){
        if(err) return console.log('failed to save service data : ' + s.name);
        p += 1;
        console.log('process :', p, '/', complete);
        if(p == complete){
            console.log('finished to save service data');
            process.exit(1);
        }
    });
});