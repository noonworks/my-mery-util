var Noonworks = Noonworks || {};

Noonworks.FileSystemObject = function(){
    this.fso = new ActiveXObject('Scripting.FileSystemObject');
};

// folderspec
Noonworks.FileSystemObject.WindowsFolder = 0;
Noonworks.FileSystemObject.SystemFolder = 1;
Noonworks.FileSystemObject.TemporaryFolder = 2;

// iomode
Noonworks.FileSystemObject.ForReading = 1;
Noonworks.FileSystemObject.ForWriting = 2;
Noonworks.FileSystemObject.ForAppending = 8;

// format
Noonworks.FileSystemObject.TristateTrue = -1;
Noonworks.FileSystemObject.TristateFalse = 0;
Noonworks.FileSystemObject.TristateUseDefault = -2;

// methods
Noonworks.FileSystemObject.prototype = {
    createDirRecursive: function(path) {
        if (!path || this.fso.FileExists(path)) {
            return false;
        }
        if (this.fso.FolderExists(path)) {
            return true;
        }
        var stack = new Array();
        var parent = this.fso.GetParentFolderName(path);
        while (true) {
            if ((parent.length === 0 && stack.length === 0)
                || this.fso.FolderExists(parent)) {
                try {
                    this.fso.CreateFolder(path);
                    while (stack.length > 0) {
                        path = this.fso.BuildPath(path, stack.pop());
                        this.fso.CreateFolder(path);
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            }
            stack.push(this.fso.GetFileName(path));
            path = parent;
            parent = this.fso.GetParentFolderName(path);
            if (parent.length === 0) {
                return false;
            }
        }
    },
    
    BuildPath: function(path, name) {
        return this.fso.BuildPath(path, name);
    },
    
    CopyFile: function(source, destination, overwrite) {
        if (typeof overwrite === 'undefined')
            return this.fso.CopyFile(source, destination);
        return this.fso.CopyFile(source, destination, overwrite);
    },
    
    CopyFolder: function(source, destination, overwrite) {
        if (typeof overwrite === 'undefined')
            return this.fso.CopyFolder(source, destination);
        return this.fso.CopyFolder(source, destination, overwrite);
    },
    
    CreateFolder: function(foldername) {
        return this.fso.CreateFolder(foldername);
    },
    
    CreateTextFile: function(filename, overwrite, unicode) {
        if (typeof overwrite === 'undefined')
            return this.fso.CreateTextFile(filename);
        if (typeof unicode === 'undefined')
            return this.fso.CreateTextFile(filename, overwrite);
        return this.fso.CreateTextFile(filename, overwrite, unicode);
    },
    
    DeleteFile: function(filespec, force) {
        if (typeof force === 'undefined')
            return this.fso.DeleteFile(filespec);
        return this.fso.DeleteFile(ilespec, force);
    },
    
    DeleteFolder: function(folderspec, force) {
        if (typeof force === 'undefined')
            return this.fso.DeleteFolder(folderspec);
        return this.fso.DeleteFolder(folderspec, force);
    },
    
    DriveExists: function(drivespec) {
        return this.fso.DriveExists(drivespec);
    },
    
    FileExists: function(filespec) {
        return this.fso.FileExists(filespec);
    },
    
    FolderExists: function(folderspec) {
        return this.fso.FolderExists(folderspec);
    },
    
    GetAbsolutePathName: function(pathspec) {
        return this.fso.GetAbsolutePathName(pathspec);
    },
    
    GetBaseName: function(path) {
        return this.fso.GetBaseName(path);
    },
    
    GetDrive: function(drivespec) {
        return this.fso.GetDrive(drivespec);
    },
    
    GetDriveName: function(path) {
        return this.fso.GetDriveName(path);
    },
    
    GetExtensionName: function(path) {
        return this.fso.GetExtensionName(path);
    },
    
    GetFile: function(filespec) {
        return this.fso.GetFile(filespec);
    },
    
    GetFileName: function(pathspec) {
        return this.fso.GetFileName(pathspec);
    },
    
    GetFolder: function(folderspec) {
        return this.fso.GetFolder(folderspec);
    },
    
    GetParentFolderName: function(path) {
        return this.fso.GetParentFolderName(path);
    },
    
    GetSpecialFolder: function(folderspec) {
        return this.fso.GetSpecialFolder(folderspec);
    },
    
    GetTempName: function() {
        return this.fso.GetTempName();
    },
    
    MoveFile: function(source, destination) {
        return this.fso.MoveFile(source, destination);
    },
    
    MoveFolder: function(source, destination) {
        return this.fso.MoveFolder(source, destination);
    },
    
    OpenTextFile: function(filename, iomode, create, format) {
        if (typeof iomode === 'undefined')
            return this.fso.OpenTextFile(filename);
        if (typeof create === 'undefined')
            return this.fso.OpenTextFile(filename, iomode);
        if (typeof format === 'undefined')
            return this.fso.OpenTextFile(filename, iomode, create);
        return this.fso.OpenTextFile(filename, iomode, create, format);
    },
    
    dispose: function() {
        this.fso = null;
    }
};

Noonworks.Path = function(original_string, default_dir){
    if (typeof default_dir === 'undefined') {
        default_dir = Document.Path;
    }
    this._setPath(original_string, default_dir);
};

Noonworks.Path._pos_probably = /[a-zA-Z0-9\.]/;
Noonworks.Path._sep_regex = /\//g;
Noonworks.Path._dup_sep_regex = /\\\\/g;
Noonworks.Path._drive_regex = /^[a-zA-Z]:/;
Noonworks.Path._line_regex = /^:?([0-9]+).*/;

Noonworks.Path.PossibilityCertain = 100;
Noonworks.Path.PossibilityParentCertain = 75;
Noonworks.Path.PossibilityMaybeWantToMake = 60;
Noonworks.Path.PossibilityNotButMakeIfWant = 50;
Noonworks.Path.PossibilityParentNotButWouldMake = 30;
Noonworks.Path.PossibilityUnknown = 15;
Noonworks.Path.PossibilityNever = 0;

Noonworks.Path.possibilitySort = function (x,y) {
    if (y.possibility === x.possibility) {
        if (x.possibility < Noonworks.Path.PossibilityParentCertain) {
            return y.path.length - x.path.length;
        }
        return 0;
    } else {
        return y.possibility - x.possibility;
    }
};

Noonworks.Path.getLineFromPostfix = function (postfix) {
    if (! Noonworks.Path._line_regex.test(postfix)) return 0;
    postfix = postfix.replace(Noonworks.Path._line_regex, "$1");
    var l = parseInt(postfix, 10);
    if (isNaN(l)) return 0;
    return l;
}

Noonworks.Path.prototype = {
    _setPath: function(original_string, default_dir) {
        var fso = new Noonworks.FileSystemObject();
        var shell = new ActiveXObject('WScript.Shell');
        this.original_string = original_string;
        var path_line = this._fixFilePathLine(shell, fso, original_string, default_dir);
        this.line = path_line[1];
        var path = path_line[0];
        this.path = path;
        this.parent = fso.GetParentFolderName(path);
        this.name = fso.GetFileName(path);
        this.exists = true;
        this.parentExists = true;
        if (fso.FolderExists(path)) {
            this.isFile = false;
            this.isDir = true;
        } else if (fso.FileExists(path)) {
            this.isFile = true;
            this.isDir = false;
        } else {
            this.exists = false;
            this.parentExists = fso.FolderExists(this.parent);
            this.isFile = (this.name.indexOf('.') >= 0);
            this.isDir = ! this.isFile;
        }
        if (this.parentExists) {
            this.grandParentExists = true;
        } else {
            var gp = fso.GetParentFolderName(this.parent);
            if (gp.length > 0) {
                this.grandParentExists = fso.FolderExists(gp);
            } else {
                this.grandParentExists = false;
            }
        }
        this.possibility = this._detectPossibility();
    },
    
    _detectPossibility: function() {
        if (this.path.length === 0) {
            return Noonworks.Path.PossibilityNever; // 0
        }
        if (this.exists) {
            return Noonworks.Path.PossibilityCertain; // 100
        }
        if (! /[\\\/]/g.test(this.original_string)) {
            if (Noonworks.Path._pos_probably.test(this.original_string)) {
                return Noonworks.Path.PossibilityMaybeWantToMake; // 60
            }
            return Noonworks.Path.PossibilityNotButMakeIfWant; // 50
        }
        if (this.parentExists) {
            return Noonworks.Path.PossibilityParentCertain; // 75
        } else if (this.grandParentExists) {
            return Noonworks.Path.PossibilityParentNotButWouldMake; // 30
        }
        return Noonworks.Path.PossibilityUnknown; // 15
    },
    
    _hasDrive: function(fso, str) {
        try {
            fso.GetDrive(fso.GetDriveName(str));
            return true;
        } catch (e) {}
        return (str.substring(0, 2) === '\\\\');
    },
    
    _fixInvalidChar: function(str) {
        str = str.replace(Noonworks.Path._sep_regex, '\\');
        if (str.length > 1 && Noonworks.Path._dup_sep_regex.test(str.substring(1))) {
            return '';
        }
        var cln_i = 0;
        if (Noonworks.Path._drive_regex.test(str)) {
            // only drive
            if (str.length == 2) {
                return [str, 0];
            }
            // invalid as drive path ([a-zA-Z]:[^\\])
            if (str.substring(2, 3) !== '\\') {
                return ['', 0];
            }
            // skip colon in drive
            cln_i = 2;
        }
        // line postfix
        var line = 0;
        cln_i = str.indexOf(':', cln_i);
        if (cln_i > 1) {
            line = Noonworks.Path.getLineFromPostfix(str.substring(cln_i));
            str = str.substring(0, cln_i);
        }
        return [str, line];
    },
    
    _fixFilePathLine: function(shell, fso, str, default_dir) {
        if (str.length === 0) {
            return ['', 0];
        }
        str = shell.ExpandEnvironmentStrings(str);
        str_line = this._fixInvalidChar(str);
        str = str_line[0];
        var line = str_line[1];
        // check including drive name
        if (this._hasDrive(fso, str)) {
            return [str, line];
        }
        // allow slash for separator
        str = str.replace(/\//g, '\\');
        // check including drive name
        if (this._hasDrive(fso, str)) {
            return [str, line];
        }
        // if drive name is not found, add default_dir
        str = fso.BuildPath(default_dir, str);
        return [str, line];
    },
    
    dump: function() {
        var items = new Array('original_string', 'path', 'parent', 'name',
            'exists', 'isFile', 'isDir', 'parentExists', 'possibility');
        var str = '';
        for (var i = 0; i < items.length; i++) {
            str = str + items[i] + ' [' + this[items[i]] + ']\n';
        }
        return str;
    }
};
