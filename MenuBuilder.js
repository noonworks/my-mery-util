if (typeof Noonworks === 'undefined') {
    var Noonworks = {};
}
if (typeof Noonworks.MenuBuilder === 'undefined') {
    Noonworks.MenuBuilder = function() {
        var need_sep = false;
        this.menu = {};
        this.count = 0;
        this.addItem = function(name, item) {
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
        };
        this.addSep = function() {
            this.menu[Noonworks.MenuBuilder.randomSepString()] = 'sep';
        };
        this.minify = function(str, num) {
            return Noonworks.MenuBuilder.minifyString(str, num);
        };
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
    Noonworks.MenuBuilder.randomSepString = function() {
        return '----' + (new Date()).getTime() +
            'abcdefghijklmnopqrstuvwxyz'.substring(Math.floor(Math.random() * 10), 26);
    };
}
