/*
 * Required node packages
 */

var express = require('express'),
    cheerio = require('cheerio');

/*
 * String trim function
 */

var trim = function(string){
    return string.replace(/^\s+|\s+$/g, '');
};

/*
 * Array cleaner function
 */

var clean = function(array){
    var cleaned = [];

    for(var i = 0; i < array.length; i++){
        if(array[i]){
            cleaned.push(array[i]);
        }
    }

    return cleaned;
};

/*
 * Newspaper module
 */

function newspaper(){
    /*
     * Newspaper - .getTitle(html)
     */

    this.getTitle = function(html){
        var $ = cheerio.load(html),
            title = '',
            title_element = $('title');

        // Title tag doesn't exist
        if(!title_element){
            return title;
        }

        // Title tag exists
        var title_text = trim(title_element.text());

        var refined_title = trim(this.refineTitle(title_text));

        if(!refined_title){
            var  used_delimeter = false,
                 splitters = ['|', '-', '_', '/', ':'];

            for(var i = 0; i < splitters.length; i++){
                var s = splitters[i];

                if(!used_delimeter && title_text.indexOf(s) > -1){
                    title_text = this.splitTitle(title_text, s);
                    used_delimeter = true;
                }
            }
        }else{
            title_text = refined_title;
        }

        return title_text;
    };

    this.splitTitle = function(title, splitter){
        var large_text_length = 0,
            large_text_index = 0;

        var title_pieces = title.split(splitter);

        for(var i = 0; i < title_pieces.length; i++){
            var current = title_pieces[i];
            if(current.length > large_text_length){
                large_text_length = current.length;
                large_text_index = i;
            }
        }

        title = title_pieces[large_text_index];

        return trim(title);
    };

    this.refineTitle = function(title){
        var words = ['신문', '뉴스'],
            splitters = ['|', '-', '_', '/', ':'];

        var title_pieces = title.split(" "),
            check_pieces = false;

        for(var i = 0; i < title_pieces.length; i++){
            for(var j = 0; j < words.length; j++){
                if(title_pieces[i].indexOf(words[j]) > -1){
                    title_pieces[i] = '';
                    check_pieces = true;
                }
            }
        }

        var refined_pieces = clean(title_pieces).join(" ");

        //

        var check_splits = false,
            refined_splits = title;

        for(var i = 0; i < splitters.length; i++){
            var splitter = splitters[i];
                title_splits = title.split(splitter);

            for(var j = 0; j < title_splits.length; j++){
                for(var k = 0; k < words.length; k++){
                    if(title_splits[j].indexOf(words[k]) > -1){
                        title_splits[j] = '';
                        check_splits = true;
                    }
                }
            }

            if(check_splits &&clean(title_splits).length > 0){
                refined_splits = clean(title_splits).join(splitter);
            }
        }

        //

        var output = '';

        if(check_pieces || check_splits){
            if(refined_pieces.length < refined_splits.length){
                output = refined_pieces;
            }else{
                output = refined_splits;
            }
        }

        return output;
    };

    /*
     * Newspaper - .getContent(html)
     */

    this.getContent = function(html){
        html = String(html).replace(/<!--[\s\S]*?-->/g, "");
        html = String(html).replace(/\n|\r/g, "");

        var $ = cheerio.load(html);

        $('script, style, head, meta, ul, h6, h5, h4, h3, h2, h1').remove();

        var parents = $('br, p').parent(':contains("다.")');

        var all_str = "", all_str_reversed = "";

        for(var i = 0; i < parents.length; i++){
            var children = $(parents[i]).children();

            var children_str = "",
                parent_str = $(parents[i]).text();

            for(var j = 0; j < children.length; j++){
                children_str += $(children[j]).text();
            }

            children_str = trim(children_str.replace(/\t/g, ''));
            parent_str = trim(parent_str.replace(/\t/g, ''));

            if(parent_str.indexOf(children_str) == -1){
                str = parent_str + '\n' + children_str;
            }else{
                str = parent_str;
            }

            if(all_str != ""){
                if(all_str.indexOf(str) == -1 && str.indexOf(all_str) == -1){
                    all_str = str + '\n' + all_str;
                }
            }else{
                if(all_str.indexOf(str) == -1){
                    all_str = str + '\n' + all_str;
                }
            }
        }

        for(var i = parents.length - 1; i >= 0; i--){
            var children = $(parents[i]).children();

            var children_str = "",
                parent_str = $(parents[i]).text();

            for(var j = 0; j < children.length; j++){
                children_str += $(children[j]).text();
            }

            children_str = trim(children_str.replace(/\t/g, ''));
            parent_str = trim(parent_str.replace(/\t/g, ''));

            if(parent_str.indexOf(children_str) == -1){
                str = parent_str + '\n' + children_str;
            }else{
                str = parent_str;
            }

            if(all_str_reversed != ""){
                if(all_str_reversed.indexOf(str) == -1 && str.indexOf(all_str_reversed) == -1){
                    all_str_reversed = str + '\n' + all_str_reversed;
                }
            }else{
                if(all_str_reversed.indexOf(str) == -1){
                    all_str_reversed = str + '\n' + all_str_reversed;
                }
            }
        }

        var output_str = "";

        if(all_str.length < all_str_reversed.length){
            output_str = all_str;
        }else{
            output_str = all_str_reversed;
        }

        return this.refineContent(output_str);
    };

    this.refineContent = function(content){
        var lines = content.split('\n'),
            refined = [];

        for(var i = 0; i < lines.length; i++){
            if(lines[i].length > 300){
                refined.push(lines[i]);
            }
        }

        return refined.join('\n');
    };
};


module.exports = {
    Newspaper: newspaper
};
