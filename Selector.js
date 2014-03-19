if (typeof Noonworks === 'undefined') {
    var Noonworks = {};
}
if (typeof Noonworks.Selector === 'undefined') {
    Noonworks.Selector = {};
    Noonworks.Selector.fso = new ActiveXObject('Scripting.FileSystemObject');
    Noonworks.Selector.shell = new ActiveXObject('WScript.Shell');
    Noonworks.Selector.separateLine = function(line, posX_l) {
        var l = (posX_l == 1) ? '' : line.substring(0, posX_l - 1);
        var r = (posX_l > line.length) ? '' : line.substring(posX_l - 1, line.length);
        return new Array(l, r,
            (l.length == 0) ? '' : l.substring(l.length - 1, l.length),
            (r.length == 0) ? '' : r.substring(0, 1));
    };
    Noonworks.Selector.spacer = /[\t\n 　]+/;
    Noonworks.Selector.getString = function(l, r, l1, r1, separator) {
        if (this.spacer.test(l1) && this.spacer.test(r1)) {
            return '';
        }
        var ret = '';
        if (l1.length > 0 && ! separator.test(l1)) {
            var arr = l.split(separator);
            ret = (arr.length > 0) ? arr[arr.length - 1] : '';
        }
        if (r1.length > 0 && ! separator.test(r1)) {
            var arr = r.split(separator);
            ret = ret + ((arr.length > 0) ? arr[0] : '');
        }
        return ret.replace(/^\s*|\s*$/g, '');
    };
    Noonworks.Selector.getQuotedString = function(l, r, l1, r1, q_start, q_end) {
        if (typeof q_end === "undefined") {
            q_end = q_start;
        }
        var i_start = l.lastIndexOf(q_start);
        if (i_start < 0) {
            return '';
        }
        var i_end = r.indexOf(q_end);
        if (i_end < 0) {
            return '';
        }
        return l.substring(i_start + q_start.length, l.length) + r.substring(0, i_end);
    };
    Noonworks.Selector.stripQuote = function(str, q_start, q_end) {
        if (typeof q_end === "undefined") {
            q_end = q_start;
        }
        if (str.length < q_start.length || str.length < q_end.length) {
            return str;
        }
        if (str.substring(0, q_start.length) === q_start &&
            str.substring(str.length - q_end.length, str.length) === q_end) {
            return str.substring(q_start.length, str.length - q_end.length);
        }
        return str;
    };
    Noonworks.Selector.fixUrl = function(str) {
        if (str.indexOf('http://') < 0 &&
            str.indexOf('https://') < 0 &&
            str.indexOf('www') < 0) {
            return '';
        }
        return str;
    };
    Noonworks.Selector.getPathInfo = function(path) {
        var ret = { parent: '', name:'',
            isExist:false, isFile:false, isDir:false, parentExists:false };
        ret.parent = this.fso.GetParentFolderName(path);
        ret.name = this.fso.GetFileName(path);
        ret.isExist = true;
        ret.parentExists = true;
        if (this.fso.FolderExists(path)) {
            ret.isFile = false;
            ret.isDir = true;
        } else if (this.fso.FileExists(path)) {
            ret.isFile = true;
            ret.isDir = false;
        } else {
            ret.isExist = false;
            ret.parentExists = this.fso.FolderExists(ret.parent);
            ret.isFile = (ret.name.indexOf('.') >= 0);
            ret.isDir = ! ret.isFile;
        }
        return ret;
    };
    Noonworks.Selector.dumpPathInfo = function(info) {
        var items = new Array('parent', 'name',
            'isExist', 'isFile', 'isDir', 'parentExists');
        var str = '';
        for (var i = 0; i < items.length; i++) {
            str = str + items[i] + ' [' + info[items[i]] + ']\n';
        }
        return str;
    };
    Noonworks.Selector.fixFilePath = function(str) {
        if (str.length == 0) {
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
    };
    Noonworks.Selector.getAsUrl = function(l, r, l1, r1) {
        // URL区切りの定義
        var separator = /[\t\<\>\|\\\{\}\^\[\]\`\n\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        s = this.stripQuote(s, "'").replace(/^\s*|\s*$/g, '');
        return this.fixUrl(s);
    };
    Noonworks.Selector.getAsCommonUrl = function(l, r, l1, r1) {
        // URL区切りの定義 + 一般的に使わない文字()「」【】『』 　'
        var separator = /[\t\<\>\|\\\{\}\^\[\]\`\n\(\)「」【】『』 　\'\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        s = this.stripQuote(s, "'").replace(/^\s*|\s*$/g, '');
        return this.fixUrl(s);
    };
    Noonworks.Selector.getAsFilePath = function(l, r, l1, r1) {
        // パス名区切りの定義
        var separator = /[\t\<\>\|\/\?\*\n\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        s = this.stripQuote(s, "'").replace(/^\s*|\s*$/g, '');
        return this.fixFilePath(s);
    };
    Noonworks.Selector.getAsCommonFilePath = function(l, r, l1, r1) {
        // パス名区切りの定義 + 一般的に使わない文字`;=
        var separator = /[\t\<\>\|\/\?\*\n\`\;\=\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        s = this.stripQuote(s, "'").replace(/^\s*|\s*$/g, '');
        return this.fixFilePath(s);
    };
    Noonworks.Selector.getAsSentence = function(l, r, l1, r1) {
        // 文区切りの定義
        var separator = /[\.\?\!]\s|[\t\n。！？\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        return this.stripQuote(s, "'");
    };
    Noonworks.Selector.getAsWord = function(l, r, l1, r1) {
        // 単語区切りの定義
        var separator = /[\t 「」『』【】（）\[\]\(\)　。、！？\,\?\!\;\:\\\n\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        return this.stripQuote(s, "'");
    };
    Noonworks.Selector.getAsCommonWord = function(l, r, l1, r1) {
        // 単語区切りの定義 + 一般的に使われない文字.
        var separator = /[\t 「」『』【】（）\[\]\(\)　。！？、\,\?\!\;\:\.\\\n\"]+/;
        var s = this.getString(l, r, l1, r1, separator);
        return this.stripQuote(s, "'");
    };
    Noonworks.Selector.getAsDoubleQuoted = function(l, r, l1, r1) {
        return this.getQuotedString(l, r, l1, r1, '"');
    };
    Noonworks.Selector.getAsSingleQuoted = function(l, r, l1, r1) {
        return this.getQuotedString(l, r, l1, r1, "'");
    };
    Noonworks.Selector.getSelectionInfo = function() {
        var sel = Document.Selection;
        var ret = {};
        var posX_l = sel.GetActivePointX(mePosLogical);
        var posY_l = sel.GetActivePointY(mePosLogical);
        var line = Document.GetLine(posY_l, 0).replace('\n', '');
        var lr = this.separateLine(line, posX_l);
        ret.sel         = sel.IsEmpty ? '' : sel.Text;
        ret.posX_l      = posX_l;
        ret.posY_l      = posY_l;
        ret.line        = line;
        ret.path_raw    = this.getAsFilePath(lr[0], lr[1], lr[2], lr[3]);
        ret.path        = this.getAsCommonFilePath(lr[0], lr[1], lr[2], lr[3]);
        ret.url_raw     = this.getAsUrl(lr[0], lr[1], lr[2], lr[3]);
        ret.url         = this.getAsCommonUrl(lr[0], lr[1], lr[2], lr[3]);
        ret.sentence    = this.getAsSentence(lr[0], lr[1], lr[2], lr[3]);
        ret.word        = this.getAsWord(lr[0], lr[1], lr[2], lr[3]);
        ret.word_c      = this.getAsCommonWord(lr[0], lr[1], lr[2], lr[3]);
        ret.d_quoted    = this.getAsDoubleQuoted(lr[0], lr[1], lr[2], lr[3]);
        ret.s_quoted    = this.getAsSingleQuoted(lr[0], lr[1], lr[2], lr[3]);
        if (ret.url == ret.url_raw) {
            ret.url_raw = '';
        }
        if (ret.path == ret.path_raw) {
            ret.path_raw = '';
        }
        if (ret.word == ret.word_c) {
            ret.word_c = '';
        }
        if (ret.d_quoted == ret.s_quoted) {
            ret.s_quoted = '';
        }
        return ret;
    };
    Noonworks.Selector.dumpSelectionInfo = function(info) {
        var str = '';
        var items = new Array('posX_l', 'posY_l', 'line',
            'path', 'path_raw', 'url', 'url_raw',
            'sentence', 'word', 'word_c', 'd_quoted', 's_quoted');
        for (var i = 0; i < items.length; i++) {
            str = str + items[i] + ' [' + info[items[i]] + ']\n';
        }
        return str;
    };
}
