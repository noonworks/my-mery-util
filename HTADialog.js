/*
    HTADialog.js - Show HTA dialog from Mery Macro.
    
    (c) 2014 noonworks (https://github.com/noonworks)
    MIT License.
    
    USAGE:
    See dialog_sample.js (Mery Macro) and sample_dialog.hta (dialog).
    
    REQUIRE:
    'json2.js' (https://github.com/douglascrockford/JSON-js)
      - Mery Macro: #include "json2.js"
      - HTA(HTML): <script type="text/javascript" src="json2.js"></script>
    
    RESTRICTION:
    (1) It can pass or receive only strings. Use JSON to pass or receive objects.
    (2) Mery will be 'Not Responding' during showing HTA dialog.
    
    OVERVIEW:
    (1) Serialize data to JSON and save it to temp file. (Mery Macro)
    (2) Open HTA with temp file path as GET parameter. (Mery Macro)
    (3) Check parameter and deserialize data from temp file. (HTA)
    (4) Return value to Mery Macro through standard I/O. (HTA)
*/

var Noonworks = Noonworks || {};

Noonworks.HTADialog = function(path){ /* constructor */
    path = path.replace(/\//g, '\\');
    this.fso = new ActiveXObject('Scripting.FileSystemObject');
    var script_path = (typeof(WScript) !== 'undefined')
        ? WScript.ScriptFullName
        : (ScriptFullName ? ScriptFullName : '');
    var script_dir = this.fso.GetParentFolderName(script_path);
    this.path = this.fso.GetAbsolutePathName(path);
    if (! this.fso.FileExists(this.path)) {
        var p = this.fso.BuildPath(script_dir, path);
        if (this.fso.FileExists(p)) {
            this.path = p;
        }
    }
    this.url = 'file:///' + this.path.replace(/\\/g, '/');
};

with ({d: Noonworks.HTADialog}) { /* static members */
    d.data = null;
    d.data_passed = false;
    d.returnString = function(str) {
        new ActiveXObject('Scripting.FileSystemObject')
            .GetStandardStream(1).Write(str);
    };
    
    d.returnObject = function(data_object) {
        d.returnString(d.pack(data_object));
    };
    
    d.pack = function(data_object) {
        if (typeof(data_object) !== 'object') {
            data_object = {data: data_object};
        }
        try {
            return JSON.stringify(data_object);
        } catch (e) {
            return '"' + data_object.toString().replace(/"/g, '\\"') + '"';
        }
    };
    
    d.unpack = function(return_string) {
        try {
            return JSON.parse(return_string);
        } catch (e) {
            return return_string;
        }
    };
    
    d.saveAsUTF8NoBOM = function(text, path, stream) {
        if (typeof(stream) === 'undefined') {
            stream = new ActiveXObject('ADODB.Stream');
        }
        var bin = null;
        try {
            stream.Type = 2 /* adTypeText */;
            stream.Charset = 'utf-8';
            stream.Open();
            stream.WriteText(text);
            stream.Position = 0;
            stream.Type = 1 /* adTypeBinary */;
            stream.Position = 3;
            bin = stream.Read();
        } catch (e) {
            return 'can not write utf-8 data (1).';
        } finally {
            stream.Close();
        }
        if (bin === null) {
            return 'can not write utf-8 data (2).';
        }
        try {
            stream.Type = 1 /* adTypeBinary */;
            stream.Open();
            stream.Write(bin);
            stream.SaveToFile(path, 2 /* adSaveCreateOverWrite */);
        } catch (e) {
            return 'can not write file [' + path + '] .';
        } finally {
            stream.Close();
        }
        return '';
    };
    
    d.readAsUTF8 = function(path, stream) {
        if (typeof(stream) === 'undefined') {
            stream = new ActiveXObject('ADODB.Stream');
        }
        try {
            stream.Type = 2 /* adTypeText */;
            stream.Charset = 'utf-8';
            stream.Open();
            stream.LoadFromFile(path);
            return stream.ReadText();
        } catch (e) {
            return null;
        } finally {
            stream.Close();
        }
    };
}

Noonworks.HTADialog.prototype = { /* members */
    show: function(data_object) {
        var data_path = this._saveDataObject(data_object);
        var e = new ActiveXObject('WScript.Shell')
            .Exec('MSHTA.EXE "' + this.url + '?NOONWORKS_HTADIALOG='
                + encodeURIComponent(data_path) + '"');
        return Noonworks.HTADialog.unpack(e.StdOut.ReadAll());
    },
    
    _saveDataObject: function(data_object) {
        switch (typeof(data_object)) {
            case 'undefined':
                data_object = {}; break;
            case 'object': break;
            default:
                data_object = { 'data':data_object }; break;
        }
        var path = this.fso.BuildPath(
            this.fso.GetSpecialFolder(2 /* TemporaryFolder */),
            this.fso.GetTempName() + '.json');
        var err = Noonworks.HTADialog.saveAsUTF8NoBOM(
            Noonworks.HTADialog.pack(data_object), path);
        if (err.length === 0) {
            return path;
        }
        return '';
    }
}

/* for HTA */
if (typeof(location) !== 'undefined') {
    var m = (/[\?\&]NOONWORKS_HTADIALOG=(.*)\&?/i).exec(location.search);
    if (m !== null) {
        with ({d: Noonworks.HTADialog}) {
            var data_path = decodeURIComponent(m[1]);
            var fso = new ActiveXObject('Scripting.FileSystemObject');
            var txt = d.readAsUTF8(data_path);
            try {
                fso.DeleteFile(data_path);
            } catch (e) {}
            d.data = Noonworks.HTADialog.unpack(txt);
            d.data_passed = true;
        }
    }
}
