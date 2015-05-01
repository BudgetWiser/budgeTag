/*
 *  Required node packages
 */

var express = require('express'),
    tagModel = require('./model');

/*
 * Model setup
 */

//var ModelName = tagModel.ModelName;

/*
 * Views
 */

view = {};

view.index = function(req, res){
    res.status(200)
    res.render('test');
};

/*
 * Route initialize
 */

function setup(app){
    app.get('/', function(req, res){res.redirect('/tag')});

    //view
    app.get('/tag', view.index);
}

module.exports = setup;
