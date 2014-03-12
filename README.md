my-mery-util
============

My Mery utilities.
All of files are released under [the MIT License](http://opensource.org/licenses/mit-license.php).
So you can use them freely.

[Mery](http://www.haijin-boys.com/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8)
is simple and powerful text editor for Windows written by [Kuro](https://github.com/haijinboys).

自分用のMeryユーティリティです。
すべて[MITライセンス](http://opensource.org/licenses/mit-license.php)で配布されます。
なので自由にご利用いただけます。

[Mery](http://www.haijin-boys.com/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8)
は [Kuro](https://github.com/haijinboys) 氏によるWindows用のシンプルで多機能なテキストエディタです。


toEnd.js
---------------
Go to the end of line. If already in the end of line, go to the end of next line.

行末に移動します。すでに行末だった場合は、次の行の行末に移動します。


GFMtoHTML.js
---------------

Convert currently GFM (GitHub Flavored Markdown) to HTML with [GitHub Markdown API](
https://developer.github.com/v3/markdown/).

現在開いているGFM(GitHub Flavored Markdown)ファイルをHTMLファイルに変換します。

### Installation
1. Get [gfm-wsh](https://github.com/noonworks/gfm-wsh) files.
2. Copy `gfm.js` `gfm_header.html` `gfm_footer.html` `github.css` to Mery macro directory.
3. Copy `GFMtoHTML.js` to Mery macro directory.
4. Open Mery and [マクロ] - [選択] and select `GFMtoHTML.js`.

### Personal access token
If you have a 'Personal access token' for GitHub API,
set it to variable `access_token` in `GFMtoHTML.js`.
You can get Personal access tokens on [GitHub Setting page](
https://github.com/settings/applications).

* If you set the token, you can use API 5,000 times per hour.
* If not, 60 times per hour.

### インストール
1. [gfm-wsh](https://github.com/noonworks/gfm-wsh) のファイルをダウンロードします。
2. `gfm.js` `gfm_header.html` `gfm_footer.html` `github.css` をMeryのマクロフォルダにコピーします。
3. `GFMtoHTML.js` をMeryのマクロフォルダにコピーします。
4. Meryを開き、[マクロ] - [選択] から `GFMtoHTML.js` を選択します。

### トークン
GitHub APIの'Personal access token'がある場合は、`GFMtoHTML.js`の`access_token`変数に設定してください。
Personal access tokensは[GitHub設定ページ](https://github.com/settings/applications)で
取得できます。

* トークンを設定した場合、1時間に5,000回のAPIが使用できます。
* 設定しなかった場合は、1時間に60回のAPIが使用できます。
