var express = require('express'),
    passport = require('passport'),
    accountModels = require('./model');

var User = accountModels.User;

/*
 * Route initialize
 */

var typeNumber = 0;

var view = {};

view.login = function(req, res){
    if(req.user){
        res.redirect('back');
    }else{
        res.render('tag/login', {
            layout: 'tag/layout'
        });
    }
};

view.register = function(req, res){
    if(req.user){
        res.redirect('back');
    }else{
        res.render('tag/register', {
            layout: 'tag/layout'
        });
    }
};

var api = {};

api.login = function(req, res){
    passport.authenticate('local', function(err, user, info){
        if(err){
            console.log(err);
            return res.redirect('/login');
        }
        if(!user){
            return res.redirect('/login');
        }
        req.login(user, function(err){
            if(err){
                console.log(err);
                return res.redirect('/login');
            }
            res.redirect('/search');
        });
    })(req, res);
};

api.logout = function(req, res){
    req.logout();
    res.redirect('/search');
};

api.register = function(req, res){
    var username = req.body.username,
        password = req.body.password;

    User.register(
        new User({
            username: username,
            type: typeNumber
        }),
        password,
        function(err, account){
            typeNumber += 1;
            if(typeNumber > 2){
                typeNumber = 0;
            }
            if(err){
                console.log(err);
                return res.redirect('/register');
            }else{
                api.login(req, res);
            }
        }
    );
};

function setup(app){
    app.get('/login', view.login);
    app.get('/register', view.register);
    app.get('/logout', api.logout);

    app.post('/login', api.login);
    app.post('/register', api.register);
};

module.exports = setup;
