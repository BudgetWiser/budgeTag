/*
 * user strict mode
 */

'use strict';

/*
 * Result module
 */

var Result = {};

Result.initialize = function(issue, rels){
    this.issue = issue;
    this.rels = rels;

    this.list = $('.related-list');

    Result.registerHandlers();
    Result.drawRelatedCards(Result.rels);
};

Result.registerHandlers = function(){
};

Result.drawRelatedCards = function(services){
    services.map(function(service){
        if(service.agree > service.disagree || service.did == "true"){
            var tag = Elm.relatedCard(service);
        }

        $(Result.list).append(tag);
    });
};

/*
 * Elements
 */

var Elm = {};

Elm.relatedCard = function(service){
    var sum = service.sum[0];
    if(sum == 0){
        sum = service.sum[1];
    }
    var check = "";
    if(service.agree <= service.disagree){
        check = "just-your-idea";
    }

    var tag =
        '<li class="related-item participate-' + service.did + ' ' + check + '">' +
            '<div class="related-item-rel">' +
                '<ul class="related-item-rel-list on_' + service.rel + '">' +
                    '<li class="related-item-rel-item agree">' + service.agree + '</li>' +
                    '<li class="related-item-rel-item noidea">' + service.noidea + '</li>' +
                    '<li class="related-item-rel-item disagree">' + service.disagree + '</li>' +
                '</ul>' +
            '</div>' +
            '<div class="related-item-info">' +
                '<span class="related-item-category">' + service.categories.join(' > ') + '</span>' +
                '<span class="related-item-name">' + service.name + '</span>' +
                '<span class="related-item-sum">' + sum + '원</span>' +
            '</div>' +
        '</li>';

    return $(tag);
};
