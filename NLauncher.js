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
    var alp = /^[a-zA-Z0-9 \t　\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]*$/;
    var sel = new Noonworks.Selector();
    //alert(sel.dump());
    var lnc = new Noonworks.Launcher();
    var mb = new Noonworks.MenuBuilder();
    
    // open url
    for (var i = 0; i < sel.urls.length; i++) {
        with({ item:sel.urls[i] }) {
            mb.addItem('URLを開く[' + mb.minify(item, URL_MINIFY_LEN) + ']',
                function(){ lnc.openUrl(item) });
        } // end with scope
    }
    mb.need_sep = mb.isGrown();
    
    // open path menu
    items = (mb.count > 0) ? new Array() : sel.pathes;
    for (var i = 0; i < items.length; i++) {
        if (items[i].length == 0) {
            continue;
        }
        var submb = new Noonworks.MenuBuilder();
        with({ item : items[i],
               p : new Noonworks.PathInfo(items[i]) }) {
            // open if exists
            if (p.isExist) {
                if (p.isDir) {
                    submb.addItem('エクスプローラで開く',
                        function(){ lnc.openExplorer(item) });
                    submb.addItem('ここでコマンドプロンプトを開く',
                        function(){ lnc.openCmd(item) });
                } else  {
                    submb.addItem('Meryで開く',
                        function(){ lnc.openMery(item) });
                    submb.addItem('関連付けされたプログラムで開く',
                        function(){ lnc.open(item) });
                }
            } else {
            // create if not exists
                if (p.isDir) {
                    submb.addItem('このフォルダを作る', function(){
                        if (Confirm('以下のフォルダを作成します。\n' + item)) {
                            if (! lnc.createDirRecursive(item)) {
                                alert('フォルダ作成に失敗しました。\n' + item);
                            } else {
                                Status = 'フォルダ作成：' + item;
                            }
                        }
                    });
                } else {
                    submb.addItem('Meryで作成', function() {
                        if (! p.parentExists) {
                            if (!Confirm('親フォルダを作成して開きます。\n' + p.parent)) {
                                return;
                            }
                            if (! lnc.createDirRecursive(p.parent)) {
                                alert('フォルダ作成に失敗しました。\n' + p.parent);
                                return;
                            } else {
                                Status = 'フォルダ作成：' + p.parent;
                            }
                        }
                        lnc.createWithMery(item);
                    });
                }
            }
            // add separator if needed
            submb.need_sep = submb.isGrown();
            // open parent folder if exists
            if (p.parentExists) {
                submb.addItem('親フォルダをエクスプローラで開く',
                    function(){ lnc.openExplorer(p.parent) });
                submb.addItem('親フォルダでコマンドプロンプトを開く',
                    function(){ lnc.openCmd(p.parent) });
            } else {
            // create parent folder if not exists
                submb.addItem('親フォルダを作る', function() {
                    if (Confirm('以下のフォルダを作成します。\n' + p.parent)) {
                        if (! lnc.createDirRecursive(p.parent)) {
                            alert('フォルダ作成に失敗しました。\n' + p.parent);
                        } else {
                            Status = 'フォルダ作成：' + p.parent;
                        }
                    }
                });
            }
            // add submenu
            if (submb.count > 0) {
                var prefix = p.isFile ? 'ファイル: ' : 'フォルダ: ';
                mb.addItem(prefix + mb.minify(item, PATH_MINIFY_LEN), submb.menu);
            }
        } // end with scope
    }
    mb.need_sep = mb.isGrown();
    
    // keyword menu
    items = sel.words;
    for (var i = 0; i < items.length; i++) {
        if (items[i].length == 0) {
            continue;
        }
        var submb = new Noonworks.MenuBuilder();
        with({ item:items[i] }) {
            submb.addItem('前を検索', function(){ lnc.search(item, false) });
            submb.addItem('次を検索', function(){ lnc.search(item, true) });
            submb.addSep();
            submb.addItem('Googleで検索', function(){ lnc.searchGoogle(item) });
            if (alp.test(item)) {
                submb.addItem('Google翻訳で翻訳（英→日）',
                    function(){ lnc.openGoogleTranslateEnToJa(item) });
            } else {
                submb.addItem('Google翻訳で翻訳（日→英）',
                    function(){ lnc.openGoogleTranslateJaToEn(item) });
            }
            submb.addSep();
            submb.addItem('Wikipediaで検索', function(){ lnc.searchWikipedia(item) });
        } // end with scope
        mb.addItem(mb.minify(items[i], WORD_MINIFY_LEN), submb.menu);
    }
    
    // show
    if (mb.count > 0) {
        ShowPopupMenu(mb.menu);
    } else {
        Status = 'NLauncher: No actions detected.';
    }
})();
