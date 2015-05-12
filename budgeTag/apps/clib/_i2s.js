var express = require('express'),
    fs = require('fs'),
    async = require('async'),
    Parser = require('./parser').Parser;

var issues = [
    '안전',
    '대기 오염(미세먼지)',
    '청년 실험'
];

var parser = new Parser();
var i2s = {};

var parsing = function(issue, callback){
    parser.getBudgetByKeyword(issue, function(services){
        i2s[issue] = [];

        services.map(function(service){
            i2s[issue].push(service.name);
        });

        console.log(issue, ':', services.length);

        callback(null, null);
    });
};

async.map(issues, parsing, function(err, obj){
    fs.writeFile('data/i2s.json', JSON.stringify(i2s), 'utf8', function(err){
        if(err){
            handleError(err);
            return console.log(err);
        }

        console.log('----completed----');
        process.exit(1);
    });
});
