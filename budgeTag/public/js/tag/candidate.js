/*
 * user strict mode
 */

'use strict';

/*
 * Candidate module
 */

var Candidate = {};

Candidate.initialize = function(keyword, services){
    this.keyword = keyword;
    this.services = services;

    this.list = $('.cands-list');
    this.submit = $('#submit');

    Candidate.drawServiceCards(this.services);

    this.button_groups = $('.cands-item-buttons');

    Candidate.registerHandlers();
};

Candidate.registerHandlers = function(){
    for(var i = 0; i < Candidate.button_groups.length; i++){
        Candidate.buttonActions(Candidate.button_groups[i]);
    }
    $(Candidate.submit).click(function(){Candidate.submitCands(); console.log('clicked')});
};

Candidate.drawServiceCards = function(services){
    services.map(function(service){
        var tag = Elm.serviceCard(service);

        $(Candidate.list).append(tag);
    });
};

Candidate.buttonActions = function(button_group){
    var buttons = $(button_group).children();

    for(var i = 0; i < buttons.length; i++){
        var button = buttons[i];

        $(button).click(function(){
            $(buttons).removeClass('sel').addClass('nor');
            $(this).addClass('sel');
        });
    }
};

Candidate.submitCands = function(){
    var cands = [];

    for(var i = 0; i < Candidate.button_groups.length; i++){
        var buttons = $(Candidate.button_groups[i]).children();
        var service_id = $(Candidate.button_groups[i]).attr('class').split(' ')[1];

        for(var j = 0; j < buttons.length; j++){
            if($(buttons[j]).hasClass('sel')){
                cands.push([service_id, 1 - j]);
            }
        }
    }

    var data = {
        keyword: Candidate.keyword,
        cands: cands
    };

    $.ajax({
        type: 'POST',
        url: '/tag/submit',
        data: data,
        success: function(obj){
            Candidate.openResult(obj);
        },
        error: function(){
            console.log('Error');
        }
    });
};

Candidate.openResult = function(obj){
    var keyword = obj.keyword,
        cands = obj.cands;

    window.location = '/tag/result?keyword=' + obj.keyword + '&cands=' + obj.cands;
};

/*
 * Elements
 */

var Elm = {};

Elm.serviceCard = function(service){
    var sum = service.sum[0];
    if(sum == 0){
        sum = service.sum[1];
    }
    sum = (sum / 10000000).toFixed(2);

    var calc = sum;

    if(sum == 0.00){
        calc = "000";
    }

    var tag =
        '<li class="cands-item">' +
            '<div class="cands-item-info">' +
                '<span class="cands-item-sum money-' + (calc.length - 3) +'">' + sum + '</span>' +
                '<span class="cands-item-category">' + service.categories.join(' > ') + '</span>' +
                '<span class="cands-item-name">' + service.name + '</span>' +
            '</div>' +
            '<div class="cands-item-buttons ' + service._id + '">' +
                '<button class="cands-item-agree nor">관련 있음</button>' +
                '<button class="cands-item-noidea nor">생각 없음</button>' +
                '<button class="cands-item-disagree nor">관련 없음</button>' +
            '</div>' +
        '</li>';


    return $(tag);
};
