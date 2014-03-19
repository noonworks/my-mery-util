if (typeof Noonworks === 'undefined') {
    var Noonworks = {};
}
if (typeof Noonworks.Launcher === 'undefined') {
    Noonworks.Launcher = {};
    Noonworks.Launcher.fso = new ActiveXObject('Scripting.FileSystemObject');
    Noonworks.Launcher.shell = new ActiveXObject('WScript.Shell');
    
    Noonworks.Launcher.createDirRecursive = function(path) {
        var stack = new Array();
        while ((! this.fso.FolderExists(path)) && (! this.fso.FileExists(path))) {
            parent = this.fso.GetParentFolderName(path);
            if (this.fso.FolderExists(parent)) {
                try {
                    this.fso.CreateFolder(path);
                    while (stack.length > 0) {
                        path = this.fso.BuildPath(path, stack.pop());
                        this.fso.CreateFolder(path);
                    }
                } catch (e) {
                    return false;
                }
                break;
            }
            stack.push(this.fso.GetFileName(path));
            path = parent;
        }
        if (this.fso.FileExists(path)) {
            return false;
        }
        return true;
    };
    
    Noonworks.Launcher.openMery = function(path) {
        Editor.OpenFile(path, meEncodingNone, meOpenAllowNewWindow);
    };
    Noonworks.Launcher.createOpenMeryFunc = function(path) {
        return function() {
            Noonworks.Launcher.openMery(path);
        };
    };
    
    Noonworks.Launcher.createWithMery = function(path) {
        this.createDirRecursive(this.fso.GetParentFolderName(path));
        this.fso.CreateTextFile(path, true);
        this.openMery(path);
    };
    Noonworks.Launcher.createCreateWithMeryFunc = function(path) {
        return function() {
            Noonworks.Launcher.createWithMery(path);
        };
    };
    
    Noonworks.Launcher.openCmd = function(path) {
        if (path == '') {
            path = Document.Path;
            if (path == '') {
                path = this.shell.SpecialFolders('Desktop');
            }
        }
        this.shell.CurrentDirectory = path;
        this.shell.Run('cmd');
    };
    Noonworks.Launcher.createOpenCmdFunc = function(path) {
        return function() {
            Noonworks.Launcher.openCmd(path);
        };
    };
    
    Noonworks.Launcher.openExplorer = function(path) {
        if (path == '') {
            path = Document.Path;
            if (path == '') {
                path = this.shell.SpecialFolders('Desktop');
            }
        }
        this.shell.CurrentDirectory = path;
        this.shell.Run('explorer.exe "' + path + '"');
    };
    Noonworks.Launcher.createOpenExplorerFunc = function(path) {
        return function() {
            Noonworks.Launcher.openExplorer(path);
        };
    };
    
    Noonworks.Launcher.openUrl = function(url) {
        if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
            url = 'http://' + url;
        }
        this.shell.Run(url);
    };
    Noonworks.Launcher.createOpenUrlFunc = function(path) {
        return function() {
            Noonworks.Launcher.openUrl(path);
        };
    };
    
    Noonworks.Launcher.open = function(str) {
        this.shell.Run(str);
    };
    Noonworks.Launcher.createOpenFunc = function(path) {
        return function() {
            Noonworks.Launcher.open(path);
        };
    };
    
    Noonworks.Launcher.search = function(str, next) {
        var direction = next ? meFindNext : meFindPrevious;
        Document.selection.Find(str, direction);
    };
    Noonworks.Launcher.createSearchFunc = function(str, next) {
        return function() {
            Noonworks.Launcher.search(str, next);
        };
    };
    
    Noonworks.Launcher.searchGoogle = function(str) {
        var url = 'https://www.google.co.jp/search?q=' + encodeURI(str);
        Noonworks.Launcher.openUrl(url);
    };
    Noonworks.Launcher.createSearchGoogleFunc = function(str) {
        return function() {
            Noonworks.Launcher.searchGoogle(str);
        };
    };
    
    Noonworks.Launcher.searchWikipedia = function(str) {
        var url = 'http://ja.wikipedia.org/w/index.php?search=' + encodeURI(str);
        Noonworks.Launcher.openUrl(url);
    };
    Noonworks.Launcher.createSearchWikipediaFunc = function(str) {
        return function() {
            Noonworks.Launcher.searchWikipedia(str);
        };
    };
    
    Noonworks.Launcher.openGoogleTranslateJaToEn = function(str) {
        var url = 'https://translate.google.co.jp/#ja/en/' + encodeURI(str);
        Noonworks.Launcher.openUrl(url);
    };
    Noonworks.Launcher.createOpenGoogleTranslateJaToEnFunc = function(str) {
        return function() {
            Noonworks.Launcher.openGoogleTranslateJaToEn(str);
        };
    };
    Noonworks.Launcher.openGoogleTranslateEnToJa = function(str) {
        var url = 'https://translate.google.co.jp/#en/ja/' + encodeURI(str);
        Noonworks.Launcher.openUrl(url);
    };
    Noonworks.Launcher.createOpenGoogleTranslateEnToJaFunc = function(str) {
        return function() {
            Noonworks.Launcher.openGoogleTranslateEnToJa(str);
        };
    };
}
