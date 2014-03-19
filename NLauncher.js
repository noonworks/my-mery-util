#title = "NLauncher"
#include "Selector.js"
#include "Launcher.js"
#include "MenuBuilder.js"
#include "ShowPopupMenu.js"
 
(function(){
    Status = '';
    var URL_MINIFY_LEN = 30;
    var PATH_MINIFY_LEN = 40;
    var WORD_MINIFY_LEN = 50;
    var sel = Noonworks.Selector.getSelectionInfo();
    //alert(Noonworks.Selector.dumpSelectionInfo(sel));
    var mb = new Noonworks.MenuBuilder();
    // open url
    var items = new Array(sel.url, sel.url_raw);
    for (var i = 0; i < items.length; i++) {
        if (items[i].length > 0) {
            mb.addItem('URLを開く[' + mb.minify(items[i], URL_MINIFY_LEN) + ']',
                Noonworks.Launcher.createOpenUrlFunc(items[i]));
        }
    }
    if (mb.count > 0) {
        mb.need_sep = true;
    }
    var counts = mb.count;
    // open path menu
    items = new Array(sel.path, sel.path_raw);
    if (mb.count > 0) {
        items = new Array();
    }
    for (var i = 0; i < items.length; i++) {
        if (items[i].length == 0) {
            continue;
        }
        var p = Noonworks.Selector.getPathInfo(items[i]);
        var submb = new Noonworks.MenuBuilder();
        if (p.isDir) {  // Directory
            if (p.isExist) {
                submb.addItem('エクスプローラで開く',
                    Noonworks.Launcher.createOpenExplorerFunc(items[i]));
                submb.addItem('ここでコマンドプロンプトを開く',
                    Noonworks.Launcher.createOpenCmdFunc(items[i]));
            } else {
                submb.addItem('このフォルダを作る', (function(path){ return function() {
                    if (Confirm('以下のフォルダを作成します。\n' + path)) {
                        if (! Noonworks.Launcher.createDirRecursive(path)) {
                            alert('フォルダ作成に失敗しました。\n' + path);
                        } else {
                            Status = 'フォルダ作成：' + path;
                        }
                    }
                };})(items[i]));
            }
            if (submb.count > 0) {
                submb.need_sep = true;
            }
            if (p.parentExists) {
                submb.addItem('親フォルダをエクスプローラで開く',
                    Noonworks.Launcher.createOpenExplorerFunc(p.parent));
                submb.addItem('親フォルダでコマンドプロンプトを開く',
                    Noonworks.Launcher.createOpenCmdFunc(p.parent));
            }
        } else {    // File
            if (p.isExist) {
                submb.addItem('Meryで開く',
                    Noonworks.Launcher.createOpenMeryFunc(items[i]));
                submb.addItem('関連付けされたプログラムで開く',
                    Noonworks.Launcher.createOpenFunc(items[i]));
            } else {
                submb.addItem('Meryで作成',
                    (function(path, parent, parentExists){ return function() {
                        if ((! parentExists) &&
                            Confirm('親フォルダを作成して開きます。\n' + parent)) {
                            if (! Noonworks.Launcher.createDirRecursive(parent)) {
                                alert('フォルダ作成に失敗しました。\n' + parent);
                                return;
                            } else {
                                Status = 'フォルダ作成：' + parent;
                            }
                        }
                        Noonworks.Launcher.createWithMery(path);
                    };})(items[i], p.parent, p.parentExists));
            }
            if (submb.count > 0) {
                submb.need_sep = true;
            }
            if (p.parentExists) {
                submb.addItem('親フォルダをエクスプローラで開く',
                    Noonworks.Launcher.createOpenExplorerFunc(p.parent));
                submb.addItem('親フォルダでコマンドプロンプトを開く',
                    Noonworks.Launcher.createOpenCmdFunc(p.parent));
            } else {
                submb.addItem('親フォルダを作る',
                    (function(parent){ return function() {
                        if (Confirm('以下のフォルダを作成します。\n' + parent)) {
                            if (! Noonworks.Launcher.createDirRecursive(parent)) {
                                alert('フォルダ作成に失敗しました。\n' + parent);
                            } else {
                                Status = 'フォルダ作成：' + parent;
                            }
                        }
                    };})(p.parent));
            }
        }
        if (submb.count > 0) {
            var prefix = p.isFile ? 'ファイル: ' : 'フォルダ: ';
            mb.addItem(prefix + mb.minify(items[i], PATH_MINIFY_LEN), submb.menu);
        }
    }
    if (mb.count > counts) {
        mb.need_sep = true;
    }
    counts = mb.count;
    items = new Array(sel.sel, sel.d_quoted, sel.s_quoted,
        sel.word, sel.word_c, sel.sentence);
    var inserted = new Array();
    var alp = /^[a-zA-Z0-9 \t　\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]*$/;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        for (var j = 0; j < inserted.length; j++) {
            if (inserted[j] === item) {
                item = '';
                break;
            }
        }
        if (item.length == 0) {
            continue;
        }
        inserted.push(item);
        var submb = new Noonworks.MenuBuilder();
        submb.addItem('前を検索',
            Noonworks.Launcher.createSearchFunc(item, false));
        submb.addItem('次を検索',
            Noonworks.Launcher.createSearchFunc(item, true));
        submb.addSep();
        submb.addItem('Googleで検索',
            Noonworks.Launcher.createSearchGoogleFunc(item));
        if (alp.test(item)) {
            submb.addItem('Google翻訳で翻訳（英→日）',
                Noonworks.Launcher.createOpenGoogleTranslateEnToJaFunc(item));
        } else {
            submb.addItem('Google翻訳で翻訳（日→英）',
                Noonworks.Launcher.createOpenGoogleTranslateJaToEnFunc(item));
        }
        submb.addSep();
        submb.addItem('Wikipediaで検索',
            Noonworks.Launcher.createSearchWikipediaFunc(item));
        mb.addItem(mb.minify(item, WORD_MINIFY_LEN), submb.menu);
    }
    // show
    if (mb.count > 0) {
        ShowPopupMenu(mb.menu);
    } else {
        Status = 'NLauncher: No actions detected.';
    }
})();
