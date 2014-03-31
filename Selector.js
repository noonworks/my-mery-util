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
    this.fso = new Noonworks.FileSystemObject();
    this.shell = new ActiveXObject('WScript.Shell');
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
        /[\t 「」『』【】（）\[\]\(\)　。！？、\,\?\!\;\:\.\\\n\"]+/, // 単語(狭)
        /[\t 「」『』【】（）\[\]\(\)　。、！？\,\?\!\;\:\\\n\"]+/, // 単語(広)
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
    this.pathes = new Noonworks.UniqueArray();
    this.pathes_original = new Array();
    var separators = new Array( // 区切りの定義
        /[\t\<\>\|\/\?\*\n\`\;\=\"]+/,
        /[\t\<\>\|\/\?\*\n\"]+/
    );
    for (var i in separators) {
        var org = line.pickup(this.posX_l - 1, separators[i]).toString();
        var path = this.fixFilePath(org);
        if (path.length > 0) {
            var l = this.pathes._arr.length;
            this.pathes.push(path);
            if (l < this.pathes._arr.length) {
                this.pathes_original.push(org);
            }
        }
    }
    this.pathes = this.pathes._arr;
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
                    if (i !== 'fso' && i !== 'shell' && i !== 'spacer') {
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
    },
    
    fixFilePath: function(str) {
        if (str.length === 0) {
            return '';
        }
        str = this.shell.ExpandEnvironmentStrings(str);
        // check including drive name
        try {
            this.fso.GetDrive(this.fso.GetDriveName(str));
            return str;
        } catch (e) {
            if (str.substring(0, 2) === '\\\\') {
                return '';
            }
        }
        // if drive name is not found, add Document's path
        str = this.fso.BuildPath(Document.Path, str);
        return str;
    }
};
