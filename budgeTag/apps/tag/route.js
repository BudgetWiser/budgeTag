/*
 *  Required node packages
 */

var express = require('express'),
    tagModel = require('./model'),
    Parser = require('../clib/parser').Parser;

/*
 * Model setup
 */

//var ModelName = tagModel.ModelName;

/*
 * Views
 */

view = {};

view.index = function(req, res){
    res.render('test_index');
};

view.issue = function(req, res){
    var issue = req.query.issue,
        parser = new Parser();

    parser.getBudgetByKeyword(issue, function(services){
        res.render('test_issue', {
            data: services
        });
    });
};

/*
 * Route initialize
 */

function setup(app){
    app.get('/', function(req, res){res.redirect('/tag')});

    //view
    app.get('/tag', view.index);
    app.get('/issue', view.issue);
}

module.exports = setup;
