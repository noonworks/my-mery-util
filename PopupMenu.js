var Noonworks = Noonworks || {};

Noonworks.MenuItem = function(text, value, id, checked, disabled, isSeparator) {
    this.text = text;
    this.id = id;
    if (value instanceof Noonworks.PopupMenu) {
        value.setIdStart(id + 1);
        this.submenu = value;
        this.callback = function() { return null; };
    } else {
        this.submenu = null;
        if (typeof value === 'function') {
            this.callback = value;
        } else {
            this.callback = function() { return value; };
        }
    }
    checked = (typeof checked === 'undefined') ? false : checked;
    disabled = (typeof disabled === 'undefined') ? false : disabled;
    isSeparator = (typeof isSeparator === 'undefined') ? false : isSeparator;
    this._checked = checked;
    this._disabled = disabled;
    this._isSeparator = isSeparator;
    this._flag = 0;
    this._flag = checked ? (this._flag | meMenuChecked) : this._flag;
    this._flag = disabled ? (this._flag | meMenuGrayed) : this._flag;
    this._flag = isSeparator ? (this._flag | meMenuSeparator) : this._flag;
};

Noonworks.MenuItem.prototype = {
    getFlag: function() {
        return this._flag;
    },
    
    checked: function(v) {
        if (typeof v === 'undefined') {
            return this._checked;
        }
        this._checked = v;
        if (v) {
            this._flag = this._flag | meMenuChecked;
        } else {
            this._flag = this._flag ^ meMenuChecked;
        }
    },
    
    disabled: function(v) {
        if (typeof v === 'undefined') {
            return this._disabled;
        }
        this._disabled = v;
        if (v) {
            this._flag = this._flag | meMenuGrayed;
        } else {
            this._flag = this._flag ^ meMenuGrayed;
        }
    },
    
    isSeparator: function(v) {
        if (typeof v === 'undefined') {
            return this._isSeparator;
        }
        this._isSeparator = v;
        if (v) {
            this._flag = this._flag | meMenuSeparator;
        } else {
            this._flag = this._flag ^ meMenuSeparator;
        }
    }
};

Noonworks.PopupMenu = function(id_offset, separator_text){
    this.menu = new Array();
    this.need_separator = false;
    this.item_length = 0;
    this._pre_item_length = 0;
    this._id_offset = (typeof id_offset === 'undefined') ? 0 : id_offset;
    this._id_max = this._id_offset;
    this.separator_text = (typeof separator_text === 'undefined') ? '----' : separator_text;
};

Noonworks.PopupMenu.prototype = {
    setIdStart: function(id_start) {
        this._id_offset = id_start;
        var id = id_start;
        for (var i = 0; i < this.menu.length; i++) {
            this.menu[i].id = id;
            if (this.menu[i].submenu !== null) {
                id = this.menu[i].submenu.setIdStart(id + 1);
            }
            id++;
        }
        this._id_max = id - 1;
        return this._id_max;
    },
    
    getIdStart: function() {
        return this._id_offset;
    },
    
    getIdEnd: function() {
        return this._id_max;
    },
    
    getCallback: function(id) {
        if (id < this.getIdStart() || id > this.getIdEnd()) {
            return function(){};
        }
        var pmenu = this;
        var pmenustack = new Array();
        var i = 0;
        while (true) {
            if (pmenu.menu[i].id === id) {
                return pmenu.menu[i].callback;
            }
            if (pmenu.menu[i].submenu !== null
                && id >= pmenu.menu[i].submenu.getIdStart()
                && id <= pmenu.menu[i].submenu.getIdEnd()) {
                if (i < pmenu.getIdEnd()) {
                    pmenustack.push(new Array(i + 1, pmenu));
                }
                pmenu = pmenu.menu[i].submenu;
                i = 0;
            } else {
                i++;
            }
            if (i >= pmenu.menu.length) {
                if (pmenustack.length === 0) {
                    break;
                } else {
                    var m = pmenustack.pop();
                    i = m[0];
                    pmenu = m[1];
                }
            }
        }
        return function(){};
    },
    
    clear: function() {
        this.menu = new Array();
        this.need_separator = false;
        this.item_length = 0;
        this._pre_item_length = 0;
        this._id_max = this._id_offset;
    },
    
    add: function(text_or_MenuItem, value, checked, disabled, isSeparator) {
        if (this.need_separator) {
            this.addSeparator();
            this.need_separator = false;
        }
        if (text_or_MenuItem instanceof Noonworks.MenuItem) {
            this.menu.push(text_or_MenuItem);
            if (text_or_MenuItem.submenu !== null) {
                this._id_max = text_or_MenuItem.submenu.getIdEnd();
            } else {
                this._id_max++;
            }
            this.item_length++;
            return;
        }
        this.menu.push(new Noonworks.MenuItem(
            text_or_MenuItem, value, (this._id_max + 1), checked, disabled, isSeparator));
        if (value instanceof Noonworks.PopupMenu) {
            this._id_max = value.getIdEnd();
        } else {
            this._id_max++;
        }
        this.item_length++;
    },
    
    addSeparator: function(text) {
        text = (typeof text === 'undefined') ? this.separator_text : text;
        this.menu.push(
            new Noonworks.MenuItem( text, null, (this._id_max + 1), false, false, true));
        this._id_max++;
    },
    
    merge: function() {
        for (var i = 0; i < arguments.length; i++) {
            if (this === arguments[i]) {
                continue;
            }
            for (var j = 0; j < arguments[i].menu.length; j++) {
                this.add(arguments[i].menu[j]);
            }
        }
    },
    
    importArray: function(import_arr) {
        if (import_arr.length === 0) {
            return;
        }
        var i = 0;
        var arr = import_arr;
        var pmenu = this;
        var arr_stack = new Array();
        while (true) {
            var text = '';
            var value = '';
            var flags = 0;
            if (!(arr[i] instanceof Array)) {
                text = arr[i].toString();
                value = text;
            } else {
                if (arr[i].length < 1) {
                    text = pmenu.separator_text;
                } else {
                    text = arr[i][0].toString();
                    if (arr[i].length > 1) {
                        value = arr[i][1];
                        if (arr[i].length > 2) {
                            flags = arr[i][2];
                        }
                    } else {
                        value = text;
                    }
                }
            }
            if (value instanceof Array) {
                if (value.length === 0) {
                    pmenu.add(text, text);
                } else {
                    arr_stack.push(new Array(i, text, arr, pmenu));
                    pmenu = new Noonworks.PopupMenu(pmenu.getIdEnd() + 1, pmenu.separator_text);
                    arr = value;
                    i = -1;
                }
            } else {
                if (text.indexOf(pmenu.separator_text) >= 0) {
                    pmenu.addSeparator(text);
                } else {
                    var checked = (flags & meMenuChecked);
                    var disabled = (flags & meMenuGrayed);
                    var isSeparator = (flags & meMenuSeparator);
                    pmenu.add(text, value, checked, disabled, isSeparator);
                }
            }
            i++;
            while (i >= arr.length) {
                if (arr_stack.length === 0) {
                    return;
                }
                var pre_pmenu = pmenu;
                var s = arr_stack.pop();
                i = s[0] + 1;
                text = s[1];
                arr = s[2];
                pmenu = s[3];
                pmenu.add(text, pre_pmenu);
            }
        }
    },
    
    toMenu: function() {
        this.setIdStart(this._id_offset);
        var menu = CreatePopupMenu();
        for (var i = 0; i < this.menu.length; i++) {
            var item = this.menu[i];
            if (item.submenu === null) {
                menu.Add(item.text, item.id, item.getFlag());
            } else {
                menu.AddPopup(item.text, item.submenu.toMenu());
            }
        }
        return menu;
    },
    
    show: function() {
        var m = this.toMenu();
        var sel = m.Track(mePosMouse);
        return this.getCallback(sel)();
    },
    
    minify: function(str, num) {
        if (str.length <= num) {
            return str;
        }
        if (num < 2) {
            return str.substring(0, num);
        }
        var len = num / 2;
        return str.substring(0, len) + ' … ' +
            str.substring(str.length - len, str.length);
    },
    
    hasGrown: function() {
        var ret = (this._pre_item_length < this.item_length);
        this._pre_item_length = this.item_length;
        return ret;
    }
};
/*
//
//  Sample
//

// create popup menu "pm"
var pm = new Noonworks.PopupMenu();
// PopupMenu.add(text, value_or_callback, checked, disabled, isSeparator)
pm.add('abc', 'ABC');   // add normal item
pm.add('def', 'DEF', true); // add checked item
pm.add('ghi', 'GHI', false, true);  // add disabled item
pm.add('sep', 'dummy', false, false, true);  // add separator item

// create popup menu "sub"
var sub = new Noonworks.PopupMenu();
sub.add('jkl', 'JKL');
sub.add('mno', 'MNO');

// create popup menu "subsub"
var subsub = new Noonworks.PopupMenu();
subsub.add('pqr', 'PQR');
subsub.add('stu', function(){ return 'STU'; });

// add "subsub" to "sub"
sub.add('subsub...', subsub);
sub.add('vwx', 'VWX');

// add "sub" to "pm"
pm.add('sub...', sub);
pm.add('yz', 'YZ');

// add MenuItem
var item = new Noonworks.MenuItem('zero', 'ZERO', 0);
pm.add(item);

// clear menu
var numsub = new Noonworks.PopupMenu();
numsub.add('abc', 'ABC');
numsub.add('def', 'DEF');
numsub.add('ghi', 'GHI');
numsub.clear();
numsub.add('one', 'ONE');

// import from array
var arr = [
    ['two', 'TWO', meMenuChecked + meMenuGrayed],
    'THREE',
    ['four', function(){return 'FOUR';}, meMenuGrayed],
    '----',
    ['ja', [
        ['一', 'いち'],
        ['二', 'に']
    ]],
    ['----'],
    ['ja2', [
        ['三', 'さん'],
        ['四', 'よん']
    ]],
    [],
    ['ja3', [
        ['五', 'ご'],
        ['六', 'ろく']
    ]]
];
numsub.importArray(arr);

// add "numsub" to "pm"
pm.add('numsub...', numsub);

// merge menu
var numsub2 = new Noonworks.PopupMenu();
numsub2.add('one', 'ONE');
numsub2.add('two', 'TWO', true, true);
numsub2.add('THREE', 'THREE');
numsub2.add('four', function(){return 'FOUR';}, false, true);
numsub2.addSeparator();
var numsub2_2 = new Noonworks.PopupMenu();
var numsub_j = new Noonworks.PopupMenu();
numsub_j.add('一', 'いち');
numsub_j.add('二', 'に');
numsub2_2.add('ja', numsub_j);
numsub2_2.addSeparator();
var numsub_j = new Noonworks.PopupMenu();
numsub_j.add('三', 'さん');
numsub_j.add('四', 'よん');
numsub2_2.add('ja2', numsub_j);
numsub2_2.addSeparator();
var numsub_j = new Noonworks.PopupMenu();
numsub_j.add('五', 'ご');
numsub_j.add('六', 'ろく');
numsub2_2.add('ja3', numsub_j);
numsub2.merge(numsub2_2);
pm.add('numsub2...', numsub2);

// show "pm"
Status = pm.show();
*/
