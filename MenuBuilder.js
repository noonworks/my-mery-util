var Noonworks = Noonworks || {};

Noonworks.MenuBuilder = function(){
    this.need_sep = false;
    this.menu = {};
    this.count = 0;
    this._pre_count = 0;
};

Noonworks.MenuBuilder.prototype = {
    _randomSepString: function() {
        return '----' + (new Date()).getTime() +
            'abcdefghijklmnopqrstuvwxyz'.substring(Math.floor(Math.random() * 10), 26);
    },
    
    addItem: function(name, item) {
        if (item === null) {
            return false;
        }
        if (this.need_sep) {
            this.addSep();
            this.need_sep = false;
        }
        var menu_name = name;
        var i = 2;
        while (menu_name in this.menu) {
            menu_name = name + ' (' + i + ')';
            i++;
        }
        this.menu[menu_name] = item;
        this.count++;
        return true;
    },
    
    addSep: function() {
        var menu_name = this._randomSepString();
        while (menu_name in this.menu) {
            menu_name = this._randomSepString();
        }
        this.menu[menu_name] = 'sep';
    },
    
    minify: function(str, num) {
        return Noonworks.MenuBuilder.minifyString(str, num);
    },
    
    isGrown: function() {
        var ret = (this._pre_count < this.count);
        this._pre_count = this.count;
        return ret;
    }
};

Noonworks.MenuBuilder.minifyString = function(str, num) {
    if (str.length <= num) {
        return str;
    }
    if (num < 2) {
        return str.substring(0, num);
    }
    var len = num / 2;
    return str.substring(0, len) + ' … ' +
        str.substring(str.length - len, str.length);
};
