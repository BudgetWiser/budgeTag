/*
 *  Required node packages
 */

var express = require('express'),
    tagModel = require('./model'),
    accountModel = require('../account/model'),
    fs = require('fs'),
    mw = require('../account/middleware'),
    Parser = require('../clib/parser').Parser;

/*
 * Model setup
 */

var Issue = tagModel.Issue,
    Service = tagModel.Service,
    User = accountModel.User;

var i2s = JSON.parse(fs.readFileSync(__dirname + '/../clib/data/i2s.json', 'utf8'));

var keywords = ['공공 안전', '대기 오염(미세먼지 등)', '청년 실업'];

/*
 * Views
 */

var view = {};

view.service = function(req, res){
    if(req.user){
        api.rank(req, res, 'tag/service', {
            layout: 'tag/layout',
            p_service: "active",
            user: req.user
        });
    }else{
        res.render('tag/service', {
            layout: 'tag/layout',
            p_service: "active",
            user: req.user
        });
    }
};

view.search = function(req, res){
    var user = req.user,
        keyword = req.query.keyword;

    var query = [];
    keywords.map(function(k){
        query.push({
            keyword: k
        });
    });
    Issue.find({$or: query}, function(err, obj){
        if(obj.length == 0){
            keywords.map(function(k){
                var issue = new Issue({
                    keyword: k,
                    sum: 0
                });
                issue.save(function(_err){
                    if(_err) return console.log(_err);
                });
            });
        }
    });

    if(keywords.indexOf(keyword) > -1){
        view._search(req, res);
    }else{
        issues = [];

        keywords.map(function(k){
            issues.push({keyword: k});
        });

        if(req.user){
            api.rank(req, res, 'tag/search', {
                layout: 'tag/layout',
                issues: issues,
                user: user,
                p_search: "active"
            });
        }else{
            res.render('tag/search', {
                layout: 'tag/layout',
                issues: issues,
                user: user,
                p_search: "active"
            });
        }
    }
};

view._search = function(req, res){
    var user = req.user,
        keyword = req.query.keyword,
        issues = i2s;

    var usertype = user.type;

    var checked = [];

    Issue.findOne({keyword: keyword}, function(ierr, iobj){
        user.checked.map(function(_checked){
            if(String(_checked.issue) == String(iobj._id)){
                checked.push(String(_checked.service));
            }
        });

        if(usertype == 0){
            //random mode
            Service.find({}, function(err, obj){
                _services = [];
                obj.map(function(_obj){
                    if(checked.indexOf(String(_obj._id)) == -1){
                        var _sum = _obj.sum[0];
                        if(_sum == 0){
                            _sum = _obj.sum[1];
                        }
                        _sum = api.money(_sum);

                        _services.push({
                            _id: _obj._id,
                            name: _obj.name,
                            sum: _sum,
                            categories: _obj.categories.join(' > ')
                        });
                    }
                });

                api.shuffle(_services);

                if(req.user){
                    api.rank(req, res, 'tag/candidate', {
                        layout: 'tag/layout',
                        keyword: keyword,
                        services: _services.slice(0, 10),
                        user: user,
                        p_search: "active"
                    });
                }else{
                    res.render('tag/candidate', {
                        layout: 'tag/layout',
                        keyword: keyword,
                        services: _services.slice(0, 10),
                        user: user,
                        p_search: "active"
                    });
                }
            });
        }else if(usertype == 1){
            //tf-idf mode
            var services = issues[keyword];

            var query = [];
            services.map(function(service){
                query.push({
                    name: service
                });
            });

            Service.find({$or: query}, function(err, obj){
                var _services = [];
                var rearr = [];
                query.map(function(_q){
                    obj.map(function(_obj){
                        if(_q.name == _obj.name){
                            rearr.push(_obj);
                        }
                    });
                });

                rearr.map(function(_rearr){
                    if(checked.indexOf(String(_rearr._id)) == -1){
                        var _sum = _rearr.sum[0];
                        if(_sum == 0){
                            _sum = _rearr.sum[1];
                        }
                        _sum = api.money(_sum);

                        _services.push({
                            _id: _rearr._id,
                            name: _rearr.name,
                            sum: _sum,
                            categories: _rearr.categories.join(' > ')
                        });
                    }
                });

                if(_services.length >= 10){
                    //api.shuffle(_services);

                    if(req.user){
                        api.rank(req, res, 'tag/candidate', {
                            layout: 'tag/layout',
                            keyword: keyword,
                            services: _services.slice(0, 10),
                            user: user,
                            p_search: "active"
                        });
                    }else{
                        res.render('tag/candidate', {
                            layout: 'tag/layout',
                            keyword: keyword,
                            services: _services.slice(0, 10),
                            user: user,
                            p_search: "active"
                        });
                    }
                }else{
                    Service.find({}, function(err, __obj){
                        _services = [];
                        __obj.map(function(___obj){
                            if(checked.indexOf(String(___obj._id)) == -1){
                                var _sum = ___obj.sum[0];
                                if(_sum == 0){
                                    _sum = ___obj.sum[1];
                                }
                                _sum = api.money(_sum);

                                _services.push({
                                    _id: ___obj._id,
                                    name: ___obj.name,
                                    sum: _sum,
                                    categories: ___obj.categories.join(' > ')
                                });
                            }
                        });

                        api.shuffle(_services);

                        if(req.user){
                            api.rank(req, res, 'tag/candidate', {
                                layout: 'tag/layout',
                                keyword: keyword,
                                services: _services.slice(0, 10),
                                user: user,
                                p_search: "active"
                            });
                        }else{
                            res.render('tag/candidate', {
                                layout: 'tag/layout',
                                keyword: keyword,
                                services: _services.slice(0, 10),
                                user: user,
                                p_search: "active"
                            });
                        }
                    });
                }
            });
        }else{
            //random + tf-idf mode
            var services = issues[keyword];

            var query = [];
            services.map(function(service){
                query.push({
                    name: service
                });
            });

            Service.find({$or: query}, function(err, obj){
                var _services = [];
                var rearr = [];
                query.map(function(_q){
                    obj.map(function(_obj){
                        if(_q.name == _obj.name){
                            rearr.push(_obj);
                        }
                    });
                });

                rearr.map(function(_rearr){
                    if(checked.indexOf(String(_rearr._id)) == -1){
                        checked.push(_rearr._id);
                        var _sum = _rearr.sum[0];
                        if(_sum == 0){
                            _sum = _rearr.sum[1];
                        }
                        _sum = api.money(_sum);

                        _services.push({
                            _id: _rearr._id,
                            name: _rearr.name,
                            sum: _sum,
                            categories: _rearr.categories.join(' > ')
                        });
                    }
                });

                //api.shuffle(_services);

                var _services = _services.slice(0, 6);
                /*
                _service.map(function(_service){
                    checked.push(_service._id);
                });
                */

                Service.find({}, function(_err, _obj){
                    var __services = [];

                    _obj.map(function(__obj){
                        if(checked.indexOf(String(__obj._id)) == -1){
                            var _sum = __obj.sum[0];
                            if(_sum == 0){
                                _sum = __obj.sum[1];
                            }
                            _sum = api.money(_sum);

                            __services.push({
                                _id: __obj._id,
                                name: __obj.name,
                                sum: _sum,
                                categories: __obj.categories.join(' > ')
                            });
                        }
                    });

                    if(_services.length >= 6){
                        //api.shuffle(__services);

                        var __services = __services.slice(0, 4);

                        _services = _services.concat(__services);

                        if(req.user){
                            api.rank(req, res, 'tag/candidate', {
                                layout: 'tag/layout',
                                keyword: keyword,
                                services: _services,
                                user: user,
                                p_search: "active"
                            });
                        }else{
                            res.render('tag/candidate', {
                                layout: 'tag/layout',
                                keyword: keyword,
                                services: _services,
                                user: user,
                                p_search: "active"
                            });
                        }
                    }else{
                        Service.find({}, function(err, obj){
                            _services = [];
                            obj.map(function(_obj){
                                if(checked.indexOf(String(_obj._id)) == -1){
                                    var _sum = _obj.sum[0];
                                    if(_sum == 0){
                                        _sum = _obj.sum[1];
                                    }
                                    _sum = api.money(_sum);

                                    _services.push({
                                        _id: _obj._id,
                                        name: _obj.name,
                                        sum: _sum,
                                        categories: _obj.categories.join(' > ')
                                    });
                                }
                            });

                            api.shuffle(_services);

                            if(req.user){
                                api.rank(req, res, 'tag/candidate', {
                                    layout: 'tag/layout',
                                    keyword: keyword,
                                    services: _services.slice(0, 10),
                                    user: user,
                                    p_search: "active"
                                });
                            }else{
                                res.render('tag/candidate', {
                                    layout: 'tag/layout',
                                    keyword: keyword,
                                    services: _services.slice(0, 10),
                                    user: user,
                                    p_search: "active"
                                });
                            }
                        });
                    }
                });
            });
        }
    });
};

view.issues = function(req, res){
    var keyword = req.query.keyword;

    if(keywords.indexOf(keyword) > -1){
        view._issues(req, res);
    }else{
        issues = [];

        keywords.map(function(k){
            issues.push({keyword: k});
        });

        if(req.user){
            api.rank(req, res, 'tag/results', {
                layout: 'tag/layout',
                issues: issues,
                user: req.user,
                p_issues: "active"
            });
        }else{
            res.render('tag/results', {
                layout: 'tag/layout',
                issues: issues,
                user: req.user,
                p_issues: "active"
            });
        }
    }
};

view._issues = function(req, res){
    var keyword = req.query.keyword;

    Issue.findOne({keyword: keyword}, function(err, issue){
        if(err) return console.log('view.issues//issue call error :', err);

        var services = issue.services,
            related = [];

        services.forEach(function(elm, i, arr){
            var service = {
                _id: elm._id,
                name: elm.name,
                sum: api.money(elm.sum),
                categories: elm.categories.join(' > '),
                agree: elm.agree,
                disagree: elm.disagree,
                noidea: elm.noidea
            };

            if(service.agree > service.disagree){
                related.push(service);
            }
        });

        related.sort(function(a, b){
            return ((b.agree - b.disagree) - (a.agree - a.disagree));
        });

        if(req.user){
            api.rank(req, res, 'tag/show', {
                layout: 'tag/layout',
                keyword: keyword,
                rels: related,
                sum: api.money(issue.sum),
                user: req.user,
                p_issues: "active"
            });
        }else{
            res.render('tag/show', {
                layout: 'tag/layout',
                keyword: keyword,
                rels: related,
                sum: api.money(issue.sum),
                user: req.user,
                p_issues: "active"
            });
        }
    });
};

view.profile = function(req, res){
    var user = req.user;

    var checked = req.user._checked, length = [];

    var all_length = checked.length;

    keywords.map(function(k){
        var l = 0;

        checked.map(function(c){
            if(c.issue == k){
                l += 1;
            }
        });

        length.push({
            issue: k,
            length: l
        });
    });

    if(req.user){
        api.rank(req, res, 'tag/profile', {
            layout: 'tag/layout',
            user: req.user,
            p_profile: "active",
            length: length,
            all_length: all_length,
        });
    }else{
        res.render('tag/profile', {
            layout: 'tag/layout',
            user: req.user,
            p_profile: "active",
            length: length,
            all_length: all_length,
        });
    }
};

/*
 * API
 */

api = {};

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

api.money = function(m){
    var str_set = [];

    if(Math.floor(m/1000000000000) > 0){
        str_set.push(Math.floor(m/1000000000000) + '조');
        m -= Math.floor(m/1000000000000) * 1000000000000;
    }
    if(Math.floor(m/100000000) > 0){
        str_set.push(Math.floor(m/100000000) + '억');
        m -= Math.floor(m/100000000) * 100000000;
    }
    if(Math.floor(m/10000) > 0){
        str_set.push(Math.floor(m/10000) + '만');
    }
    if(str_set.length > 0){
        str_set = '약 ' + str_set.join(' ') + '원';
    }else{
        str_set = '0원'
    }

    return str_set;
};

api.save = function(req, res){
    var user = req.body.user;

    var data = req.body,
        keyword = data.keyword,
        keys = Object.keys(data);

    var services = [], rels = {};
    keys.map(function(key){
        if(key != 'keyword' && key != 'user'){
            services.push(key);
            rels[key] = data[key];
        }
    });

    Issue.findOne({'keyword': keyword}, function(err, _issue){
        if(err) return console.log('find issue error: ', err);

        var query = [];
        services.map(function(service){
            query.push({
                '_id': service
            });
        });

        Service.find({$or: query}, function(_err, _services){
            if(_err) return console.log('find service error: ', _err);

            _services.forEach(function(_service, i, arr){
                var index = -1;
                var _sum = _service.sum[0];
                if(_sum == 0){
                    _sum = _service.sum[1];
                }

                for(var i = 0; i < _issue.services.length; i++){
                    if(String(_service._id) == String(_issue.services[i]._id)){
                        index = i;
                        break;
                    }
                }

                if(index == -1){
                    //add a new related service to the issue.
                    var rel = rels[_service._id],
                        _obj = {
                            _id: _service._id,
                            name: _service.name,
                            sum: _sum,
                            categories: _service.categories,
                            agree: 0,
                            disagree: 0,
                            noidea: 0
                        };

                    if(rel == 1){
                        _obj.agree += 1;
                    }else if(rel == -1){
                        _obj.disagree += 1;
                    }else{
                        _obj.noidea += 1;
                    }

                    _issue.services.push(_obj);
                }else{
                    //add relation score to the existing related service.
                    var rel = rels[_service._id];

                    if(rel == 1){
                        _issue.services[index].agree += 1;
                    }else if(rel == -1){
                        _issue.services[index].disagree += 1;
                    }else{
                        _issue.services[index].noidea += 1;
                    }
                }
            });

            var issue_sum = 0;
            _issue.services.map(function(_s){
                if(_s.agree > _s.disagree){
                    issue_sum += parseInt(_s.sum);
                }
            });

            _issue.sum = issue_sum;

            _issue.save(function(__err){
                if(__err) return console.log('issue save error: ', __err);

                User.findOne({_id: user}, function(___err, _user){
                    if(___err) return console.log('user find error: ', ___err);

                    _services.map(function(_service){
                        _user.checked.push({
                            service: _service,
                            issue: _issue,
                            type: rels[_service._id]
                        });

                        _user._checked.push({
                            issue: _issue.keyword,
                            service: _service.name
                        });
                    });

                    _user.save(function(____err){
                        if(____err) return console.log('user save error', ____err);

                        api.result(req, res, keyword, rels);
                    });
                });
            });
        });
    });
};

api.result = function(req, res, keyword, rels){
    Issue.findOne({keyword: keyword}, function(err, issue){
        if(err) return console.log('api.result//issue call error :', err);

        var services = issue.services,
            related = [],
            my_sum = 0,
            count = 0;

        var checked = req.user._checked;
        checked.map(function(c){
            if(c.issue == issue.keyword){
                count += 1;
            }
        });

        services.forEach(function(elm, i, arr){
            var service = {
                _id: elm._id,
                name: elm.name,
                sum: api.money(elm.sum),
                categories: elm.categories.join(' > '),
                agree: elm.agree,
                disagree: elm.disagree,
                noidea: elm.noidea
            };

            if(rels[elm._id] != undefined){
                service.did = 'just-did_' + String(rels[elm._id]);
                related.push(service);
                my_sum += parseInt(elm.sum);
            }else{
                if(service.agree > service.disagree){
                    related.push(service);
                }
            }
        });

        related.sort(function(a, b){
            return ((b.agree - b.disagree) - (a.agree - a.disagree));
        });

        if(req.user){
            api.rank(req, res, 'tag/result', {
                layout: 'tag/layout',
                keyword: keyword,
                rels: related,
                sum: api.money(issue.sum),
                my_sum: api.money(my_sum),
                user: req.user,
                count: count + (Object.keys(rels)).length,
                p_search: "active"
            });
        }else{
            res.render('tag/result', {
                layout: 'tag/layout',
                keyword: keyword,
                rels: related,
                sum: api.money(issue.sum),
                my_sum: api.money(my_sum),
                user: req.user,
                count: count,
                p_search: "active"
            });
        }
    });
};

api.rank = function(req, res, page, opt){
    var user = req.user;

    var checked = user._checked;
    var l = [0, 0, 0];
    keywords.forEach(function(k, i, arr){
        checked.map(function(c){
            if(c.issue == k){
                l[i] += 1;
            }
        });
    });

    User.find({}, function(err, _users){
        var users = [], rank = 0;

        _users.map(function(_user){
            users.push({
                _id: _user._id,
                length: _user._checked.length
            });
        });

        users.sort(function(a, b){
            return b.length - a.length;
        });

        users.forEach(function(u, i, arr){
            if(String(u._id) == String(user._id)){
                rank = i + 1;
            }
        });

        var survey = 'opened';
        l.map(function(_l){
            if(_l < 50){
                survey = '';
            }
        });

        opt['rank'] = rank;
        opt['first'] = users[0].length;
        if(survey != ''){
            opt['survey'] = 'opened';
        }

        res.render(page, opt);
    });
};


/*
 * Route initialize
 */

function setup(app){
    app.get('/', function(req, res){res.redirect('/search')});

    //view
    app.get('/search', mw.isAuth, view.search);
    app.get('/issues', view.issues);
    app.get('/profile', mw.isAuth, view.profile);
    app.get('/service', view.service);

    //api
    app.post('/save', mw.isAuth, api.save);
}

module.exports = setup;
