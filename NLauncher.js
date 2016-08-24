#title = "NLauncher"
#include "Selector.js"
#include "Launcher.js"
#include "PopupMenu.js"

var Noonworks = Noonworks || {};

Noonworks.NLauncher = function(){
    this.URL_MINIFY_LEN = 30;
    this.WORD_MINIFY_LEN = 30;
    this.PATH_MINIFY_LEN = 40;
    this.alp = /^[a-zA-Z0-9 \t　\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]*$/;
    this.lnc = new Noonworks.Launcher();
    this.sel = new Noonworks.Selector();
    //alert(this.sel.dump());
    this.menu = new Noonworks.PopupMenu();
    // this document
    var m = this.makePathMenu(new Noonworks.Path(Document.FullName));
    this.menu.add('このドキュメント...', this._toSubmenu(m));
    this.menu.need_separator = true;
    // url menu
    for (var i = 0; i < this.sel.urls.length; i++) {
        this.menu.add('URL ' + this.menu.minify(this.sel.urls[i], this.URL_MINIFY_LEN),
            this._toSubmenu(this.makeUrlMenu(this.sel.urls[i])));
    }
    this.menu.need_separator = this.menu.need_separator || this.menu.hasGrown();
    // path menu
    var all_pathes_menu = new Noonworks.PopupMenu();
    var pathes = (this.sel.urls.length > 0) ? new Array() : this.sel.pathes;
    for (var i = 0; i < pathes.length; i++) {
        if (pathes[i].path.length == 0) {
            continue;
        }
        var submenu = this.makePathMenu(pathes[i]);
        var s = pathes[i].isFile ? 'File: ' : 'Dir: ';
        var l_postfix = pathes[i].line == 0 ? '' : ' (' + pathes[i].line + ')';
        if (pathes[i].possibility === Noonworks.Path.PossibilityCertain) {
            this.menu.add(s + this.menu.minify(pathes[i].path + l_postfix, this.PATH_MINIFY_LEN),
            this._toSubmenu(submenu));
        } else {
            all_pathes_menu.add(
                s + all_pathes_menu.minify(pathes[i].path + l_postfix, this.PATH_MINIFY_LEN),
                this._toSubmenu(submenu));
        }
    }
    this.menu.need_separator = this.menu.need_separator || this.menu.hasGrown();
    // keyword menu
    var line_s = new Noonworks.String(this.sel.line);
    for (var i = 0; i < this.sel.words.length; i++) {
        if (this.sel.words[i].length == 0) {
            continue;
        }
        var i_start = line_s.curIndexOf(this.sel.posX_l, this.sel.words[i]);
        var i_end = i_start + this.sel.words[i].length;
        var submenu = this.makeWordMenu(this.sel.words[i], i_start, i_end, this.sel.posY_l);
        this.menu.add('(' + this.sel.words[i].length + '文字) '
            + this.menu.minify(this.sel.words[i], this.WORD_MINIFY_LEN),
            this._toSubmenu(submenu));
    }
    this.menu.need_separator = this.menu.need_separator || this.menu.hasGrown();
    // all pathes
    this.menu.merge(all_pathes_menu);
};

Noonworks.NLauncher.prototype = {
    _toSubmenu: function(submenu) {
        return function() { submenu.show(); };
        return submenu;
    },
    
    makeWordMenu: function(word, i_start, i_end, posY_l) {
        var menu = new Noonworks.PopupMenu();
        var lnc = this.lnc;
        if (!this.sel.selected) {
            menu.add('選択', function(){ lnc.select(i_start, i_end, posY_l); });
        }
        if (ClipboardData.GetData().length > 0) {
            menu.add('クリップボードからここに貼り付け', function(){
                lnc.pasteClipboard(i_start, i_end, posY_l);
            });
        }
        menu.add('コピー', function(){ lnc.copyToClipboard(word) });
        menu.addSeparator();
        menu.add('前を検索', function(){ lnc.search(word, false) });
        menu.add('次を検索', function(){ lnc.search(word, true) });
        menu.add('ファイルから検索', function(){
            lnc.select(i_start, i_end, posY_l);
            lnc.openFileSearchDialog();
        });
        menu.addSeparator();
        menu.add('Googleで検索', function(){ lnc.searchGoogle(word) });
        if (this.alp.test(word)) {
            menu.add('Google翻訳で翻訳（英→日）',
                function(){ lnc.openGoogleTranslateEnToJa(word) });
        } else {
            menu.add('Google翻訳で翻訳（日→英）',
                function(){ lnc.openGoogleTranslateJaToEn(word) });
        }
        menu.addSeparator();
        menu.add('Wikipediaで検索', function(){ lnc.searchWikipedia(word) });
        return menu;
    },
    
    makeUrlMenu: function(url) {
        var menu = new Noonworks.PopupMenu();
        var lnc = this.lnc;
        menu.add('URLをコピー', function(){ lnc.copyToClipboard(url) });
        menu.add('URLを開く', function(){ lnc.openUrl(url) });
        return menu;
    },
    
    makePathMenu: function(p) {
        var menu = new Noonworks.PopupMenu();
        var lnc = this.lnc;
        menu.add('パスをコピー',
            function(){ lnc.copyToClipboard(p.path) });
        // open if exists
        if (p.exists) {
            if (p.isDir) {
                menu.add('エクスプローラで開く',
                    function(){ lnc.openExplorer(p.path) });
                menu.add('ここでコマンドプロンプトを開く',
                    function(){ lnc.openCmd(p.path) });
                menu.add('ここで管理者コマンドプロンプトを開く',
                    function(){ lnc.openAdminCmd(p.path) });
            } else  {
                menu.add('Meryで開く',
                    function(){ lnc.openMery(p.path, p.line) });
                menu.add('関連付けされたプログラムで開く',
                    function(){ lnc.open(p.path) });
            }
        } else {
        // create if not exists
            if (p.isDir) {
                menu.add('このフォルダを作る', function(){
                    if (Confirm('以下のフォルダを作成します。\n' + p.parent)) {
                        if (! lnc.createDirRecursive(p.parent)) {
                            alert('フォルダ作成に失敗しました。\n' + p.parent);
                        } else {
                            Status = 'フォルダ作成：' + p.parent;
                        }
                    }
                });
            } else {
                menu.add('Meryで作成', function() {
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
                    lnc.createWithMery(p.path);
                });
            }
        }
        // add separator if needed
        menu.need_separator = menu.hasGrown();
        // open parent folder if exists
        if (p.parentExists) {
            menu.add('親フォルダをエクスプローラで開く',
                function(){ lnc.openExplorer(p.parent) });
            menu.add('親フォルダでコマンドプロンプトを開く',
                function(){ lnc.openCmd(p.parent) });
            menu.add('親フォルダで管理者コマンドプロンプトを開く',
                function(){ lnc.openAdminCmd(p.parent) });
        } else {
        // create parent folder if not exists
            menu.add('親フォルダを作る', function() {
                if (Confirm('以下のフォルダを作成します。\n' + p.parent)) {
                    if (! lnc.createDirRecursive(p.parent)) {
                        alert('フォルダ作成に失敗しました。\n' + p.parent);
                    } else {
                        Status = 'フォルダ作成：' + p.parent;
                    }
                }
            });
        }
        return menu;
    }
};

(function(){
    Status = '';
    var l = new Noonworks.NLauncher();
    if (l.menu.item_length > 0) {
        l.menu.show();
    } else {
        Status = 'NLauncher: No actions detected.';
    }
})();
