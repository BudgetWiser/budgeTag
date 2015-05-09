/*
 *  Required node packages
 */

var express = require('express'),
    tagModel = require('./model'),
    Parser = require('../clib/parser').Parser;

/*
 * Model setup
 */

var Issue = tagModel.Issue,
    Service = tagModel.Service;

/*
 * Views
 */

var view = function(){
    this.search = function(req, res){
        Issue.find({}, function(err, obj){
            var issues = [];

            for(var i = 0; i < obj.length; i++){
                issues.push(obj[i].keyword);
            }

            keywords = [
                {keyword: '노인 복지'},
                {keyword: '세월호 1주년'},
                {keyword: '대중교통 요금 인상'},
                {keyword: '무상 급식'},
                {keyword: '도시 재생 종합 플랜'},
            ];
            res.render('tag/search', {
                layout: 'tag/layout',
                keywords: keywords,
                issues: issues
            });
        });
    };

    this.candidate = function(req, res){
        var keyword = req.query.keyword,
            parser = new Parser();

        Issue.findOne({'keyword': keyword}, function(err, obj){
            if(err) return console.log(err);

            if(!obj){
                var issue = new Issue({
                    keyword: keyword,
                    sum: 0
                });

                issue.save(function(_err){
                    if(_err) return console.log(_err);
                });
            }
        });

        parser.getBudgetByKeyword(keyword, function(services){
            var query = [];

            services.map(function(service){
                query.push({
                    'name': service.name
                });
            });

            var _services = Service.find({$or: query});

            _services.exec(function(err, obj){
                api.shuffle(obj);
                res.render('tag/candidate', {
                    layout: 'tag/layout',
                    keyword: keyword,
                    services: obj
                });
            });
        });
    };

    this.result = function(req, res){
        var keyword = req.query.keyword,
            cands = req.query.cands.split(',');

        for(var i = 0; i < cands.length; i++){
            var _cand = cands[i].split('__');

            cands[i] = _cand;
        }
        console.log(cands);

        Issue.findOne({'keyword': keyword}, function(err, issue){
            if(err) return console.log(err);

            var services = issue.services;
            var related = [];

            for(var i = 0; i < services.length; i++){
                var service = {
                    _id: services[i]._id,
                    name: services[i].name,
                    sum: services[i].sum,
                    categories: services[i].categories,
                    agree: services[i].agree,
                    disagree: services[i].disagree,
                    noidea: services[i].noidea,
                };


                for(var j = 0; j < cands.length; j++){
                    if(cands[j][0] == service._id){
                        service.did = "true";
                        service.rel = cands[j][1];
                        break;
                    }else{
                        service.did = "false";
                        service.rel = "x";
                    }
                }

                related.push(service);
            }

            res.render('tag/result', {
                layout: 'tag/layout',
                issue: issue,
                rels: related
            });
        });
    };
};


/*
 * APIs
 */

var api = {};

api.submit = function(req, res){
    var data = req.body;

    var cands = [],
        keyword = data.keyword;

    for(key in data){
        if(key.indexOf('cands') > -1){
            cands.push(data[key]);
        }
    }

    Issue.findOne({'keyword': keyword}, function(err, issue){
        if(err) return res.status(500);

        var cands_query = {}, query = [];

        cands.map(function(cand){
            query.push({
                '_id': cand[0]
            });
            cands_query[cand[0]] = cand[1];
        });

        Service.find({$or: query}, function(_err, services){
            if(_err) return res.status(500);

            for(var i = 0; i < services.length; i++){
                var index = -1;
                for(var j = 0; j < issue.services.length; j++){
                    if(String(services[i]._id) == String(issue.services[j]._id)){
                        index = j;
                        break;
                    }
                }
                if(index == -1){
                    issue.sum += services[i].sum[0];

                    var rel = cands_query[services[i]._id];
                    var _service = {
                        _id: services[i]._id,
                        name: services[i].name,
                        sum: services[i].sum,
                        categories: services[i].categories,
                        agree: 0,
                        disagree: 0,
                        noidea: 0
                    };

                    if(rel == 1){
                        _service.agree += 1;
                    }else if(rel == -1){
                        _service.disagree += 1;
                    }else{
                        _service.noidea += 1;
                    }

                    issue.services.push(_service);
                }else{
                    var rel = cands_query[services[i]._id];

                    if(rel == 1){
                        issue.services[index].agree += 1;
                    }else if(rel == -1){
                        issue.services[index].disagree += 1;
                    }else{
                        issue.services[index].noidea += 1;
                    }
                }
            }

            issue.save(function(__err){
                if(__err){
                    console.log(__err);
                    return res.status(500);
                }
                console.log('issue_saved');

                var output_cands = [];

                cands.map(function(cand){
                    output_cands.push(cand[0] + '__' + String(cand[1]));
                });

                res.status(200);
                res.send({
                    cands: output_cands,
                    keyword: keyword
                });
            });
        });
    });
};

api.shuffle = function(arr){
    var currentIndex = arr.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
    }

    return arr;
};


/*
 * Route initialize
 */

function setup(app){
    app.get('/', function(req, res){res.redirect('/tag/search')});

    //view
    app.get('/tag/search', new view().search);
    app.get('/tag/cands', new view().candidate);
    app.get('/tag/result', new view().result);

    //api
    app.post('/tag/submit', api.submit);
}

module.exports = setup;
