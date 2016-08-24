#include "FileSystemObject.js"
#include "String.js"

var Noonworks = Noonworks || {};

Noonworks.UniqueArray = function(arr){
    this._arr = (typeof arr !== 'undefined') ? arr : new Array();
};

Noonworks.UniqueArray.prototype = {
    push: function(val) {
        for (var i = 0; i < this._arr.length; i++) {
            if (this._arr[i] === val) {
                return;
            }
        }
        this._arr.push(val);
    }
};

Noonworks.Selector = function(){
    this.spacer = /[\t\n 　]+/;
    var sl = Document.Selection;
    this.posX_l = sl.GetActivePointX(mePosLogical);
    this.posY_l = sl.GetActivePointY(mePosLogical);
    this.line = Document.GetLine(this.posY_l, 0).replace('\n', '');
    this.selected = ! sl.IsEmpty;
    if (sl.IsEmpty) {
        sl.SelectWord();
        this.sel = sl.Text;
        sl.Collapse();
        sl.SetActivePoint(mePosLogical, this.posX_l, this.posY_l);
    } else {
        this.sel = sl.Text;
    }
    var line = new Noonworks.String(this.line);
    // 文、単語
    this.words = new Noonworks.UniqueArray();
    if (this.sel.length > 0) {
        this.words.push(this.sel);
    }
    var separators = new Array( // 区切りの定義
        '"',
        "'",
        /[「」『』【】（）〔〕［］《》≪≫＜＞\<\>\[\]\(\)]+/, // 単語(カッコ内)
        /[\t 「」『』【】（）〔〕［］《》≪≫＜＞\<\>\[\]\(\)　。！？、\,\?\!\;\:\.\\\n\"]+/, // 単語(狭)
        /[\t 「」『』【】（）〔〕［］《》≪≫＜＞\<\>\[\]\(\)　。、！？\,\?\!\;\:\\\n\"]+/, // 単語(広)
        /[\.\?\!]\s|[\t\n。！？\"]+/ // 文
    );
    for (var i in separators) {
        var quoted = (typeof separators[i] === 'string');
        var s = line.pickup(this.posX_l - 1,
            separators[i], separators[i], quoted).toString();
        if (s.length > 0) {
            this.words.push(s);
        }
    }
    this.words = this.words._arr;
    // URL
    this.urls = new Noonworks.UniqueArray();
    if (this.sel.length > 0) {
        var s = this.fixUrl(this.sel.replace(/^\s*|\s*$/g, ''));
        if (s.length > 0) {
            this.urls.push(s);
        }
    }
    var separators = new Array( // 区切りの定義
        /[\t\<\>\|\\\{\}\^\[\]\`\n\(\)「」【】『』 　\'\"]+/,
        /[\t\<\>\|\\\{\}\^\[\]\`\n\"]+/
    );
    for (var i in separators) {
        var s = line.pickup(this.posX_l - 1, separators[i])
        s = this.fixUrl(s.toString().replace(/^\s*|\s*$/g, ''));
        if (s.length > 0) {
            this.urls.push(s);
        }
    }
    this.urls = this.urls._arr;
    // Path
    this.pathes = new Array();
    var pathes_dummy = new Noonworks.UniqueArray();
    var str_array = new Noonworks.UniqueArray();
    if (this.sel.length > 0) {
        str_array.push(this.sel.replace(/\//g, '\\'));
    }
    var separators = new Array( // 区切りの定義
        /[\t\s\n\*\?\"\<\>\|]+/,
        /[\t\s\n\*\?\"\<\>\|\/\\]+/,
        /[\t\s\n\*\?\"\<\>\|\/\\ 　]+/,
        /[\t\s\n\*\?\"\<\>\|\/\\ 　\(\)（）]+/
    );
    for (var i in separators) {
        var org = line.pickup(this.posX_l - 1, separators[i]).toString();
        if (org.length > 0) {
            str_array.push(org.replace(/\//g, '\\'));
        }
    }
    for (var i = 0; i < str_array._arr.length; i++) {
        var org = str_array._arr[i];
        var path = new Noonworks.Path(org);
        var l = pathes_dummy._arr.length;
        pathes_dummy.push(path.path + "\t" + path.line);
        if (l < pathes_dummy._arr.length) {
            this.pathes.push(path);
        }
    }
    this.pathes.sort(Noonworks.Path.possibilitySort);
};

Noonworks.Selector.prototype = {
    dump: function() {
        var str = '';
        for (var i in this) {
            switch (typeof this[i]) {
                case 'string':
                case 'number':
                    str = str + i + ':' + this[i] + '\n';
                    break;
                case 'object':
                    if (i !== 'spacer') {
                        str = str + i + ' [\n';
                        for (var j in this[i]) {
                            str = str + '  ' + j + ':[' + this[i][j] + ']\n';
                        }
                        str = str + ']\n';
                    }
                    break;
            }
        }
        return str;
    },
    
    fixUrl: function(str) {
        if (str.indexOf('http://') === 0 ||
            str.indexOf('https://') === 0 ||
            str.indexOf('www') === 0) {
            return str;
        }
        return '';
    }
};
