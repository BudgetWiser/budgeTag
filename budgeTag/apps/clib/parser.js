/*
 * Required node packages
 */

var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv = require('iconv-lite'),
    async = require('async'),
    string_decoder = require('string_decoder');

var Newspaper = require('./newspaper').Newspaper,
    Budget = require('./budget').Budget;


/*
 * Parser module
 */

function parser(){
    var newspaper = new Newspaper(),
        budget = new Budget();

    var decoder = new string_decoder.StringDecoder('utf8');

    this.encodeKeyword = function(keyword){
        keyword = "서울 예산 " + keyword;

        var words = keyword.split(" ");

        words.forEach(function(w, i, arr){
            arr[i] = encodeURIComponent(w);
        });

        var encoded_keyword = words.join("+");

        return encoded_keyword;
    };

    this.getNewsLinks = function(keyword, next, callback){
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

    this.getNewsPages = function(links, next, callback){
        var reqURL = function(link, _callback){
            request.get({
                url: link,
                encoding: null
            }, function(err, res, html){
                if(res){
                    var isUTF8 = res.headers['content-type'].toLowerCase().indexOf('utf-8') > -1;
                    var decoded_html = "";

                    if(!isUTF8){
                        decoded_html = iconv.decode(html, 'euc-kr');
                    }else{
                        decoded_html = decoder.write(html);
                    }

                    if(decoded_html.indexOf('다.') == -1){
                        decoded_html = decoder.write(html);
                    }
                    console.log(decoded_html.indexOf('다.') > -1);

                    _callback(null, decoded_html);
                }else{
                    _callback(null, '');
                }
            });
        };

        async.map(links, reqURL, function(err, html){
            console.log('----------------');
            var service_cands = [];

            html.forEach(function(h, i, arr){
                if(h){
                    var content = newspaper.getTitle(h) + newspaper.getContent(h),
                        services = budget.getServices(content);

                    service_cands = service_cands.concat(services);
                }
            });

            if(service_cands.length > 0){
                var selected_services = budget.selectServices(service_cands);

                callback(selected_services);
            }else{
                callback({name: 'error'});
            }
        });
    };

    this.getBudgetByKeyword = function(keyword, callback){
        keyword = this.encodeKeyword(keyword);

        this.getNewsLinks(keyword, this.getNewsPages, callback);
    };
};


module.exports = {
    Parser: parser
};
