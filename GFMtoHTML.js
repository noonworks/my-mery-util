#title = "GFMtoHTML"

if (typeof MERYGFMTOHTML === 'undefined') var MERYGFMTOHTML = {};

// ==================================================================
// If you have a 'Personal access token' for GitHub API,
// set it to variable access_token.
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
    MERYGFMTOHTML.showStatus('GFMtoHTML: Rendering ...');
    var ret = MERYGFMTOHTML.run(file_path, file_charset, output_path);
    if (ret.length > 0) {
        Status = 'GFMtoHTML: ' + ret;
        return;
    }
    Editor.OpenFile(output_path, meEncodingUTF8WithoutSignature, meOpenAllowNewWindow);
    var rate_limit = MERYGFMTOHTML.getAPIRateLimit();
    Status = 'GFMtoHTML: ' + rate_limit;
};

MERYGFMTOHTML.main();
