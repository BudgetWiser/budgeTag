var fs = require('fs'),
    data = JSON.parse(fs.readFileSync('./data/services.json', 'utf8'));

var word_list = [],
    uniq_list = [],
    fine_list = [];

data.map(function(d){
    word_list = word_list.concat(d.words);
});

word_list.map(function(word){
    if(uniq_list.indexOf(word) == -1){
        uniq_list.push(word);
        fine_list.push({
            word: word,
            weight: 0
        });
    }
});

fine_list.forEach(function(word, i, arr){
    var w = count(word_list, word.word) * 4;
    arr[i].weight = Math.log(data.length / w);
});

fs.writeFile('./data/words.json', JSON.stringify(fine_list), 'utf8', function(err){
    if(err) return console.log(err);

    console.log('---finished---');
    process.exit(0);
});

function count(arr, e){
    var cnt = 0;

    arr.map(function(w){
        if(w == e){
            cnt += 1;
        }
    });

    return cnt;
};
