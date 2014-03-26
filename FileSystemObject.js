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
