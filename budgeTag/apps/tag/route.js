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

view.search = function(req, res){
    keywords = [
        {keyword: '아리수 수돗물'},
        {keyword: '노인 복지'},
        {keyword: '청년 실업'}
    ];
    res.render('tag/search', {
        layout: 'tag/layout',
        keywords: keywords
    });
};

view.candidate = function(req, res){
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
            res.render('tag/candidate', {
                layout: 'tag/layout',
                keyword: keyword,
                services: obj
            });
        });
    });
};

view.result = function(req, res){
};

/*
 * APIs
 */

api = {};

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
                    if(services[i] == issue.services[j].service){
                        index = j;
                    }
                }
                if(index == -1){
                    issue.sum += services[i].sum[0];

                    var rel = cands_query[services[i]._id];
                    var _service = {
                        service: services[i],
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
                if(__err) return res.status(500);

                res.status(200);
                res.send({
                    cands: cands,
                    keyword: keyword
                });
            });
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
    app.get('/tag/search', view.search);
    app.get('/tag/cands', view.candidate);

    //api
    app.post('/tag/submit', api.submit);
}

module.exports = setup;
