#title = "GFMtoHTML"

if (typeof MERYGFMTOHTML === 'undefined') var MERYGFMTOHTML = {};

// ==================================================================
// use_temporary option (default:false)
//  true:  output path is `%TEMP%/(Document.Name).GFMtoHTML.html`.
//  false: output path is `(Document.Path)/(Document.Name).GFMtoHTML.html`.
// ==================================================================
MERYGFMTOHTML.use_temporary = false;

// ==================================================================
// auto_delete option (default:false)
//  * If you use WebPreview plugin, set this option to false. *
//  true:  delete file after open output HTML file.
//  false: do nothing.
// ==================================================================
MERYGFMTOHTML.auto_delete = false;

// ==================================================================
// If you have a 'Personal access token' for GitHub API,
// set it to variable access_token.
// Or set the value to `(ScriptFullPath)/GFMtoHTML.token` file.
// You can get Personal access tokens on
// [ https://github.com/settings/applications ].
//  * If you set access token, you can use API 5,000 times per hour.
//  * If not, 60 times per hour.
// ==================================================================
MERYGFMTOHTML.access_token = '';
// /* (example)*/ MERYGFMTOHTML.access_token = 'XXXXXXXXXXXXXXXXX';

// ==================================================================
//  * Don't touch below. *
// ==================================================================
MERYGFMTOHTML.shell = new ActiveXObject('WScript.Shell');
MERYGFMTOHTML.fso = new ActiveXObject('Scripting.FileSystemObject');
MERYGFMTOHTML.isOnMery = (typeof Editors !== 'undefined');
MERYGFMTOHTML.isOnWScript = (typeof WScript !== 'undefined');
if (MERYGFMTOHTML.access_token.length === 0) {
    var token_file = MERYGFMTOHTML.fso.BuildPath(
        MERYGFMTOHTML.fso.GetParentFolderName(ScriptFullName), 'GFMtoHTML.token');
    if (MERYGFMTOHTML.fso.FileExists(token_file)) {
        var f = MERYGFMTOHTML.fso.OpenTextFile(token_file, 1); // 1=ForReading
        MERYGFMTOHTML.access_token = f.ReadLine();
        f.Close();
    }
}

// http://msdn.microsoft.com/en-us/library/aa288104.aspx
MERYGFMTOHTML.getEncodingName = function(encoding_id) {
    switch (encoding_id) {
        case meEncodingUTF16LE:
        case meEncodingUTF16BE:
            return 'utf-16';
        case meEncodingUTF8WithSignature:
        case meEncodingUTF8WithoutSignature:
            return 'utf-8';
        case meEncodingUTF7:
            return 'utf-7';
        case meEncodingArabic:
            return 'windows-1256';
        case meEncodingBaltic:
            return 'windows-1257';
        case meEncodingCentralEuropean:
            return 'x-cp1250';
        case meEncodingChineseSimplified:
            return 'gb2312';
        case meEncodingChineseTraditional:
            return 'big5';
        case meEncodingCyrillic:
            return 'x-cp1251';
        case meEncodingGreek:
            return 'windows-1253';
        case meEncodingHebrew:
            return 'windows-1255';
        case meEncodingEUC:
            return 'euc-jp';
        case meEncodingJIS:
            return 'iso-2022-jp';
        case meEncodingShiftJIS:
            return 'shift_jis';
        case meEncodingKorean:
            return 'korean';
        case meEncodingThai:
            return 'windows-874';
        case meEncodingTurkish:
            return 'windows-1254';
        case meEncodingVietnamese:
            return 'windows-1258';
        case meEncodingWesternEuropean:
            return 'latin1';
    }
};

MERYGFMTOHTML.showStatus = function(msg) {
    if (MERYGFMTOHTML.isOnMery) {
        Status = msg;
    } else if (MERYGFMTOHTML.isOnWScript) {
        WScript.Echo(msg);
    }
};

MERYGFMTOHTML.getEncoding = function() {
    if (MERYGFMTOHTML.isOnMery) {
        return MERYGFMTOHTML.getEncodingName(Document.Encoding);
    } else {
        return '_autodetect_all';
    }
};

MERYGFMTOHTML.getScriptDir = function() {
    return ScriptFullName.substring(0,
        ScriptFullName.length - ScriptName.length);
};

MERYGFMTOHTML.getGFMtoHTMLjsPath = function() {
    return MERYGFMTOHTML.getScriptDir() + 'gfm.js';
};

MERYGFMTOHTML.run = function(file_path, file_charset, output_path) {
    var header_file = MERYGFMTOHTML.getScriptDir() + 'gfm_header.html';
    var footer_file = MERYGFMTOHTML.getScriptDir() + 'gfm_footer.html';
    var cmd = 'cscript //nologo "' + MERYGFMTOHTML.getGFMtoHTMLjsPath() +
        '" -f "' + file_path + '" -e ' + file_charset +
        ' -o "' + output_path + '"' +
        ' --header "' + header_file + '"' +
        ' --footer "' + footer_file + '"';
    if (MERYGFMTOHTML.access_token.length > 0) {
        cmd = cmd + ' -t ' + MERYGFMTOHTML.access_token;
    }
    MERYGFMTOHTML.shell.Run(cmd, 0, true);
    var i = 0;
    while (! MERYGFMTOHTML.fso.FileExists(output_path)) {
        Sleep(100);
        i++;
        if (i >= 100) {
            return 'Time out to convert GFM to HTML.';
        }
    }
    return '';
};

MERYGFMTOHTML.getTemporaryFilePath = function() {
    return MERYGFMTOHTML.fso.BuildPath(
        MERYGFMTOHTML.fso.GetSpecialFolder(2), MERYGFMTOHTML.fso.GetTempName());
};

MERYGFMTOHTML.getAPIRateLimit = function() {
    var temp_file = MERYGFMTOHTML.getTemporaryFilePath();
    var cmd = 'cscript //nologo "' +
        MERYGFMTOHTML.getGFMtoHTMLjsPath() + '" -l -o "' + temp_file + '"';
    if (MERYGFMTOHTML.access_token.length > 0) {
        cmd = cmd + ' -t ' + MERYGFMTOHTML.access_token;
    }
    MERYGFMTOHTML.shell.Run(cmd, 0, true);
    var i = 0;
    while (! MERYGFMTOHTML.fso.FileExists(temp_file)) {
        Sleep(100);
        i++;
        if (i >= 100) {
            return 'Time out to get GitHub API rate limit.';
        }
    }
    var file = MERYGFMTOHTML.fso.OpenTextFile(temp_file, 1, false);
    var api_rate_limit = file.ReadLine();
    file.Close();
    MERYGFMTOHTML.fso.DeleteFile(temp_file);
    return api_rate_limit;
};

MERYGFMTOHTML.getTemporaryPath = function() {
    var fso = MERYGFMTOHTML.fso;
    var tmp = fso.GetSpecialFolder(2); // TemporaryFolder
    var path = fso.BuildPath(tmp, Document.Name + '.GFMtoHTML.html');
    if (fso.FolderExists(path)) {
        fso.DeleteFolder(path);
    }
    return path;
};

MERYGFMTOHTML.main = function() {
    if (!Document.Saved) {
        var ret = Confirm('保存しますか？');
        if (ret) {
            Document.Save();
        }
        if (!Document.Saved) {
            Status = 'GFMtoHTML: 未保存の文書はプレビューできません。'
            return;
        }
    }
    var file_path = Document.FullName;
    if (file_path.length == 0) {
        Status = 'GFMtoHTML: 未保存の文書はプレビューできません。'
        return;
    }
    var file_charset = MERYGFMTOHTML.getEncoding();
    var output_path = file_path + '.GFMtoHTML.html';
    if (MERYGFMTOHTML.use_temporary) {
        output_path = MERYGFMTOHTML.getTemporaryPath();
    }
    MERYGFMTOHTML.showStatus('GFMtoHTML: Rendering ...');
    var ret = MERYGFMTOHTML.run(file_path, file_charset, output_path);
    if (ret.length > 0) {
        Status = 'GFMtoHTML: ' + ret;
        return;
    }
    Editor.OpenFile(output_path, meEncodingUTF8WithoutSignature, meOpenAllowNewWindow);
    var rate_limit = MERYGFMTOHTML.getAPIRateLimit();
    Status = 'GFMtoHTML: ' + rate_limit;
    if (MERYGFMTOHTML.auto_delete && MERYGFMTOHTML.fso.FileExists(output_path)) {
        MERYGFMTOHTML.fso.DeleteFile(output_path);
    }
};

MERYGFMTOHTML.main();
