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
            error: req.query.error,
            layout: 'tag/layout'
        });
    }
};

view.agree = function(req, res){
    if(req.user){
        res.redirect('back');
    }else{
        res.render('tag/bregister', {
            layout: 'tag/layout'
        });
    }
};

view.register = function(req, res){
    if(req.user){
        res.redirect('back');
    }else{
        res.render('tag/register', {
            layout: 'tag/layout',
            key_error: req.query.key_error,
            email_error: req.query.email_error,
            session_error: req.query.session_error
        });
    }
};

var api = {};

api.login = function(req, res){
    passport.authenticate('local', function(err, user, info){
        if(err){
            console.log(err);
            return res.redirect('/login?error=true');
        }
        if(!user){
            return res.redirect('/login?error=true');
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
        password = req.body.password,
        key = req.body.key,
        session = req.body.session;

    if (session.length == 0) {
      return res.redirect('/register?session_error=true');
    }
    /*
    if(key == 'BudgetWiser2015'){
   */
      console.log(session);
        User.register(
            new User({
                username: username,
                type: typeNumber,
                session: session
            }),
            password,
            function(err, account){
                typeNumber += 1;
                if(typeNumber > 2){
                    typeNumber = 0;
                }
                if(err){
                    console.log(err);
                    return res.redirect('/register?email_error=true');
                }else{
                    api.login(req, res);
                }
            }
        );
    /*
    }else{
        res.redirect('/register?key_error=true');
    }
    */
};

function setup(app){
    app.get('/login', view.login);
    app.get('/register', view.register);
    app.get('/agree', view.agree);
    app.get('/logout', api.logout);

    app.post('/login', api.login);
    app.post('/register', api.register);
};

module.exports = setup;
