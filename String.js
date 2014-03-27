var Noonworks = Noonworks || {};

Noonworks.IndentString = function(s){
    this._s = s;
    this._part = '';
    if (s.length > 1) {
        this._part = s.substring(0, 1);
        for (var i = 1; i < s.length; i++) {
            if (this._part !== s.substring(i, i + 1)) {
                this._part = '';
                break;
            }
        }
    }
    if (this._part.length === 0) {
        this._unindent_reg = new RegExp('^' + this._s, 'gim');
    } else {
        this._unindent_reg = new RegExp(
            '^(' + this._part + '{1,' + this._s.length + '})', 'gim');
    }
};

Noonworks.IndentString.prototype = {
    multiply: function(n) {
        var s = '';
        for (var i = 0; i < n; i++) {
            s += this._s;
        }
        return s;
    },
    
    indent: function(level, str) {
        if (level === 0) {
            return str;
        }
        if (level < 0) {
            return this.unindent(level * -1, str);
        }
        var s = this.multiply(level);
        return s + (str.replace(/\n/g, '\n' + s));
    },
    
    unindent: function(level, str) {
        if (level === 0) {
            return str;
        }
        if (level < 0) {
            return this.indent(level * -1, str);
        }
        for (var i = 0; i < level; i++) {
            str = str.replace(this._unindent_reg, '');
        }
        return str;
    }
};

Noonworks.String = function(s){
    this._s = s;
};

Noonworks.String.prototype = new String();

Noonworks.String.prototype.valueOf =
Noonworks.String.prototype.toString = function() {
    return this._s.toString();
};

Noonworks.String.prototype.multiply = function(n) {
    var s = '';
    for (var i = 0; i < n; i++) {
        s += this._s;
    }
    return new Noonworks.String(s);
};

Noonworks.String.prototype.indent = function(level, indent_string) {
    var i = (typeof indent_string === 'undefined')
        ? new Noonworks.IndentString('    ')
        : new Noonworks.IndentString(indent_string);
    return new Noonworks.String(i.indent(level, this._s));
};

Noonworks.String.prototype.unindent = function(level, indent_string) {
    var i = (typeof indent_string === 'undefined')
        ? new Noonworks.IndentString('    ')
        : new Noonworks.IndentString(indent_string);
    return new Noonworks.String(i.unindent(level, this._s));
};

Noonworks.String.prototype.stripQuote = function(q_start, q_end) {
    q_end = (typeof q_end === 'undefined') ? q_start : q_end;
    if (this._s.length < q_start.length || this._s.length < q_end.length) {
        return this;
    }
    if (this._s.substring(0, q_start.length) === q_start &&
        this._s.substring(this._s.length - q_end.length, this._s.length) === q_end) {
        return new Noonworks.String(this._s.substring(
            q_start.length, this._s.length - q_end.length));
    }
    return this;
};

Noonworks.String.prototype.offsetMatch = function(offset, reg) {
    if (this._s.length < offset) {
        return null;
    }
    return this._s.substring(offset, this._s.length).match(reg);
};

Noonworks.String.prototype.allExec = function(reg) {
    if (!reg.global) {
        reg = new RegExp(reg.source,
            'g' + (reg.ignoreCase ? 'i' : '') + (reg.multiline ? 'm' : ''));
    }
    RegExp.lastIndex = 0;
    var ret = new Array();
    while(true) {
        var m = reg.exec(this._s);
        if (m === null) {
            return ret;
        }
        ret.push(m);
    }
};

Noonworks.String.prototype.firstExec = function(reg) {
    if (reg.global) {
        RegExp.lastIndex = 0;
    }
    return reg.exec(this._s);
};

Noonworks.String.prototype.lastExec = function(reg) {
    if (!reg.global) {
        reg = new RegExp(reg.source,
            'g' + (reg.ignoreCase ? 'i' : '') + (reg.multiline ? 'm' : ''));
    }
    RegExp.lastIndex = 0;
    var ret = null;
    while(true) {
        var m = reg.exec(this._s);
        if (m === null) {
            return ret;
        }
        ret = m;
    }
};

Noonworks.String.prototype.stripRegex = function(r_start, r_end) {
    r_start = (typeof r_start === 'string') ? new RegExp(r_start, 'ig') : r_start;
    r_end = (typeof r_end === 'undefined') ? r_start : r_end;
    r_end = (typeof r_end === 'string') ? new RegExp(r_end, 'ig') : r_end;
    var m_start = this.firstExec(r_start);
    if (m_start === null || m_start.index !== 0) {
        return this;
    }
    var m_end = this.lastExec(r_end);
    if (m_end === null || (this._s.length !== (m_end.index + m_end[0].length))) {
        return this;
    }
    return new Noonworks.String(this._s.substring(m_start[0].length, m_end.index));
};

Noonworks.String.prototype.pickup = function(index, r_start, r_end, quoted) {
    quoted = (typeof quoted === 'undefined') ? false : quoted;
    index = (index < 0) ? this._s.length + index : index;
    if (this._s.length < index || index < 0) {
        return new Noonworks.String('');
    }
    r_start = (typeof r_start === 'string') ? new RegExp(r_start, 'ig') : r_start;
    r_end = (typeof r_end === 'undefined') ? r_start : r_end;
    r_end = (typeof r_end === 'string') ? new RegExp(r_end, 'ig') : r_end;
    var left = this._s.substring(0, index);
    var right = this._s.substring(index, this._s.length);
    if (quoted && (left.length === 0 || right.length === 0)) {
        return new Noonworks.String('');
    }
    if (left.length > 0) {
        var last_sep = (new Noonworks.String(left)).lastExec(r_start);
        if (last_sep !== null) {
            left = left.substring(last_sep.index + last_sep[0].length, left.length);
        } else if (quoted) {
            return new Noonworks.String('');
        }
    }
    if (right.length > 0) {
        var first_sep = (new Noonworks.String(right)).firstExec(r_end);
        if (first_sep !== null) {
            right = right.substring(0, first_sep.index);
        } else if (quoted) {
            return new Noonworks.String('');
        }
    }
    return new Noonworks.String(left + right);
};

Noonworks.String.prototype.pickupIndexOf = function(cur_pos, arr) {
    cur_pos = (cur_pos < 0) ? this._s.length + cur_pos : cur_pos;
    if (this._s.length < cur_pos || cur_pos < 0) {
        return -1;
    }
    var search_index = 0;
    for (var i = 0; i < arr.length; i++) {
        var elem_i = this._s.indexOf(arr[i], search_index);
        if (elem_i < 0 || elem_i > cur_pos) {
            return -1;
        }
        if (elem_i <= cur_pos && (elem_i + arr[i].length) >= cur_pos) {
            return i;
        }
        search_index = elem_i + arr[i].length;
    }
    return -1;
};

Noonworks.String.prototype.curIndexOf = function(cur_pos, str) {
    if (this._s.length < str.length || str.length === 0) {
        return -1;
    }
    cur_pos = (cur_pos < 0) ? this._s.length + cur_pos : cur_pos;
    if (this._s.length < cur_pos || cur_pos < 0) {
        return -1;
    }
    var search_index = (cur_pos <= str.length) ? 0 : cur_pos - str.length;
    while (true) {
        var i = this._s.indexOf(str, search_index);
        if (i < 0 || i > cur_pos) {
            return -1;
        }
        if (i <= cur_pos && (i + str.length) >= cur_pos) {
            return i;
        }
    }
};
