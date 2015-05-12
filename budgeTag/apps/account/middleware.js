var express = require('express');

function isAuth(req, res, next){
    if(req.user){
        next();
    }else{
        res.redirect('/register');
    }
};

module.exports = {
    isAuth: isAuth
};
