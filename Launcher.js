#include "FileSystemObject.js"

var Noonworks = Noonworks || {};

Noonworks.Launcher = function(){
    this.fso = new Noonworks.FileSystemObject();
    this.shell = new ActiveXObject('WScript.Shell');
};

Noonworks.Launcher.prototype = {
    makeClosure: function(func, args) {
        return function(){
            func.apply(this, args);
        };
    },
    
    createDirRecursive: function(path) {
        return this.fso.createDirRecursive(path);
    },
    
    openMery: function(path) {
        Editor.OpenFile(path, meEncodingNone, meOpenAllowNewWindow);
    },
    
    createWithMery: function(path) {
        this.fso.createDirRecursive(this.fso.GetParentFolderName(path));
        this.fso.CreateTextFile(path, true);
        this.openMery(path);
    },
    
    openCmd: function(path) {
        path = path || Document.Path || this.shell.SpecialFolders('Desktop');
        this.shell.CurrentDirectory = path;
        this.shell.Run('cmd');
    },
    
    openExplorer: function(path) {
        path = path || Document.Path || this.shell.SpecialFolders('Desktop');
        this.shell.Run('explorer.exe "' + path + '"');
    },
    
    openUrl: function(url) {
        if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
            url = 'http://' + url;
        }
        this.shell.Run(url);
    },
    
    open: function(str) {
        this.shell.Run(str);
    },
    
    search: function(str, next) {
        Document.selection.Find(str, (next ? meFindNext : meFindPrevious));
    },
    
    openFileSearchDialog: function() {
        Editor.ExecuteCommandByID(2140);
    },
    
    searchGoogle: function(str) {
        var url = 'https://www.google.co.jp/search?q=' + encodeURI(str);
        this.openUrl(url);
    },
    
    searchWikipedia: function(str) {
        var url = 'http://ja.wikipedia.org/w/index.php?search=' + encodeURI(str);
        this.openUrl(url);
    },
    
    openGoogleTranslateJaToEn: function(str) {
        var url = 'https://translate.google.co.jp/#ja/en/' + encodeURI(str);
        this.openUrl(url);
    },
    
    openGoogleTranslateEnToJa: function(str) {
        var url = 'https://translate.google.co.jp/#en/ja/' + encodeURI(str);
        this.openUrl(url);
    },
    
    copyToClipboard: function(str) {
        if (str.replace(/\n/g, '').length > 0) {
            ClipboardData.SetData(str);
        }
    },
    
    select: function(i_start, i_end, posY_l) {
        Document.Selection.Collapse();
        Document.Selection.SetActivePoint(mePosLogical, i_start + 1, posY_l, false);
        Document.Selection.SetActivePoint(mePosLogical, i_end + 1, posY_l, true);
    },
    
    paste: function(i_start, i_end, posY_l, str) {
        this.select(i_start, i_end, posY_l);
        Document.Selection.Delete();
        Document.Write(str);
    },
    
    pasteClipboard: function(i_start, i_end, posY_l) {
        this.paste(i_start, i_end, posY_l, ClipboardData.getData());
    },
    
    execPlugin: function(plugin_id) {
        Editor.ExecuteCommandByID(7168 - 1 + plugin_id);
    }
};
