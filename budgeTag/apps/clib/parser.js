/*
 * Required node packages
 */

var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv = require('iconv-lite'),
    async = require('async'),
    newspaper = require('./newspaper');

/*
 * Parser module
 */

var parser = {};

parser.encodeKeyword = function(keyword){
    keyword = "서울 예산 " + keyword;

    var words = keyword.split(" ");

    words.forEach(function(w, i, arr){
        arr[i] = encodeURIComponent(w);
    });

    var encoded_keyword = words.join("+");

    return encoded_keyword;
};

parser.getNewsLinks = function(keyword, next, callback){
    var parseURL = "https://www.google.co.kr/search?gl=kr&tbm=nws&q=" + keyword + "&oq=" + keyword;

    var reqURL = request.get(parseURL, function(err, res, html){
        //Extract news anchors
        var $ = cheerio.load(html),
            anchor_tags = $('h3.r > a');

        var links = [];

        for(var i = 0; i < anchor_tags.length; i++){
            var a = anchor_tags[i];
            links.push("https://www.google.co.kr" + a.attribs.href);
        }

        next(links, null, callback);
    });
};

parser.getNewsPages = function(links, next, callback){
    var reqURL = function(link, _callback){
        request.get({
            url: link,
            encoding: null
        }, function(err, res, html){
            var isEncoded = res.headers['content-type'].toLowerCase().indexOf('utf-8') == -1;

            if(isEncoded){
                html = iconv.decode(html, 'euc-kr');
            }

            _callback(null, html);
        });
    };

    async.map(links, reqURL, function(err, html){
        html.forEach(function(h, i, arr){
            console.log('=======================================================================');
            var $ = cheerio.load(h);
            console.log($('title').text());
            console.log(newspaper.getTitle(h));
        });
        callback();
    });
};

parser.getBudgetByKeyword = function(keyword, callback){
    keyword = parser.encodeKeyword(keyword);

    parser.getNewsLinks(keyword, parser.getNewsPages, callback);
};

parser.getBudgetByKeyword("세월호", function(){
    console.log('---finished---')
});

module.exports = parser;
