/*
 * Required node packges
 */

var express = require('express'),
    fs = require('fs');

/*
 * Budget data
 */

var bWords = JSON.parse(fs.readFileSync(__dirname + '/data/words.json', 'utf8')),
    bServices = JSON.parse(fs.readFileSync(__dirname + '/data/services.json', 'utf8')),
    bExcept = ['서울', '서울시', '사람', '사회', '문제', '문화', '경우', '우리', '소리', '함께', '시간', '인간', '사실', '시대', '다음', '세계', '설계', '공사', '시설', '사업'];

/*
 * Budget service extractor
 */

function budget(){
    /*
     * String match with a word
     */

    var match = function(str, w){
        var matched = [];

        if(w.length == 0){
            return matched;
        }

        var remained = str;

        while(remained.indexOf(w) != -1){
            var matched_index = remained.indexOf(w);

            remained = remained.slice(matched_index + 1);

            if(matched.length != 0){
                matched_index = matched[matched.length - 1] + matched_index + 1;
            }

            matched.push(matched_index);
        }

        return matched;
    };

    /*
     * Return n items from 0 index
     */

    var select = function(l, n){
        var output = [];

        for(var i = 0; i < n; i++){
            output.push(l[i]);
        }

        return output;
    };

    /*
     * Budget - .getServices(content)
     */

    this.getServices = function(content){
        var matched_words = this.matchWords(content),
            matched_services = this.matchServices(matched_words);

        var selected = select(matched_services, 10);

        if(selected.indexOf(undefined) > -1){
            console.log("newspaper didn't work well.");
            return [];
        }

        return selected;
    };

    this.matchWords = function(content){
        var matched_words = [];

        bWords.map(function(bWord){
            if(bExcept.indexOf(bWord.word) == -1 && bWord.word.length > 1){
                var word = bWord.word,
                    weight = bWord.weight,
                    matched = match(content, word);

                if(matched.length > 0){
                    matched_words.push([word, weight * matched.length]);
                }
            }
        });

        return matched_words;
    };

    this.matchServices = function(matched_words){
        var matched_services = [];

        bServices.map(function(bService){
            var words = bService.words,
                weight = 0;

            for(var i = 0; i < words.length; i++){
                var word = words[i];

                for(var j = 0; j < matched_words.length; j++){
                    var matched_word = matched_words[j];

                    if(word == matched_word[0]){
                        var matched_weight = matched_word[1] * word.length;

                        if(word.length == 2){
                            matched_weight = matched_weight * 0.7;
                        }

                        weight += matched_weight;
                    }
                }
            }

            if(weight > 0){
                matched_services.push({
                    name: bService.name,
                    weight: weight,
                    info: bService
                });
            }
        });

        matched_services.sort(function(a, b){return b.weight - a.weight});

        return matched_services;
    };

    /*
     * Budget - .selectServices
     */

    this.selectServices = function(services){
        var selected = [];

        for(var i = 0; i < services.length; i++){
            var service = services[i], checked = false;

            for(var j = 0; j < selected.length; j++){
                var _service = selected[j];

                if(service.name == _service.name){
                    selected[j].weight += service.weight;
                    checked = true;

                    break;
                }
            }

            if(!checked){
                selected.push(service);
            }
        }

        return select(selected, 5);
    };
};


module.exports = {
    Budget: budget
};
