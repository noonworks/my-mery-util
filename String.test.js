(function(){
    function assert(a,b) {
        if (a != b)
            WScript.Echo('assertion error\n' + a + '\n' + b);
    }
    
    var s = new Noonworks.String('"abc"');
    assert('abc', s.stripQuote('"'));
    assert('abc', s.stripQuote('"', '"'));
    assert('"abc"', s.stripQuote("'"));
    
    var s = new Noonworks.String('abc abb abcd abdd');
    var m = s.offsetMatch(6, /ab[^ ]*/g);
    assert(m.toString(), 'abcd,abdd');
    var m = s.offsetMatch(10, /ab[^ ]*/);
    assert(m.toString(), 'abdd');
    var m = s.offsetMatch(0, /ab[^ ]*/);
    assert(m.toString(), 'abc');
    var m = s.offsetMatch(20, /ab[^ ]*/);
    assert(m, null);
    
    var all = s.allExec(/(ab)([^ ]*)/);
    assert(all.length, 4);
    assert(all[0].index, 0);
    assert(all[0], 'abc,ab,c');
    assert(all[1].index, 4);
    assert(all[1], 'abb,ab,b');
    assert(all[2].index, 8);
    assert(all[2], 'abcd,ab,cd');
    assert(all[3].index, 13);
    assert(all[3], 'abdd,ab,dd');
    
    var all = s.allExec(/(ab)([^ ]*)/g);
    assert(all.length, 4);
    assert(all[0].index, 0);
    assert(all[0], 'abc,ab,c');
    assert(all[1].index, 4);
    assert(all[1], 'abb,ab,b');
    assert(all[2].index, 8);
    assert(all[2], 'abcd,ab,cd');
    assert(all[3].index, 13);
    assert(all[3], 'abdd,ab,dd');
    
    var m = s.firstExec(/(ab)([^ ]*)/);
    (/(ab)([^ ]*)/).exec(s._s);
    assert(m.index, 0);
    assert(m, 'abc,ab,c');
    m = s.firstExec(/(ab)([^ ]*)/);
    assert(m.index, 0);
    assert(m, 'abc,ab,c');
    
    var m = s.firstExec(/(ab)([^ ]*)/g);
    (/(ab)([^ ]*)/g).exec(s._s);
    (/(ab)([^ ]*)/g).exec(s._s);
    assert(m.index, 0);
    assert(m, 'abc,ab,c');
    m = s.firstExec(/(ab)([^ ]*)/g);
    assert(m.index, 0);
    assert(m, 'abc,ab,c');
    
    var m = s.lastExec(/(ab)([^ ]*)/);
    (/(ab)([^ ]*)/).exec(s._s);
    assert(m.index, 13);
    assert(m, 'abdd,ab,dd');
    m = s.lastExec(/(ab)([^ ]*)/);
    assert(m.index, 13);
    assert(m, 'abdd,ab,dd');
    
    var m = s.lastExec(/(ab)([^ ]*)/g);
    (/(ab)([^ ]*)/g).exec(s._s);
    (/(ab)([^ ]*)/g).exec(s._s);
    assert(m.index, 13);
    assert(m, 'abdd,ab,dd');
    m = s.lastExec(/(ab)([^ ]*)/);
    assert(m.index, 13);
    assert(m, 'abdd,ab,dd');
    
    var sep = / /;
    var arr = 'abc def  ghi   jkl   '.split(sep);
    assert(4, arr.length);
    assert('jkl', arr[arr.length - 1]);
    
    sep = /　/;
    arr = 'abc def  ghi   jkl'.split(sep);
    assert(1, arr.length);
    assert('abc def  ghi   jkl', arr[arr.length - 1]);
    
    arr = ''.split(sep);
    assert(1, arr.length);
    assert('', arr[arr.length - 1]);
    
    s = new Noonworks.String('<h1>test<span>test</span></h1>');
    assert(s, s.stripRegex(/<h11[^\n>]*>/, /<\/h1>/));  // not match start
    assert(s, s.stripRegex(/test/, /<\/h1>/));          // match but not start of string
    assert(s, s.stripRegex(/<h1[^\n>]*>/, /<\/h11>/));  // match start but not match end
    assert(s, s.stripRegex(/<h1[^\n>]*>/, /<\/span>/)); // match start and match end but not end of string
    assert('test<span>test</span>', s.stripRegex(/<h1[^\n>]*>/, /<\/h1>/)); // match!
    
    s = new Noonworks.String('<h1 class="simple">test<span>test</span></h1>');
    assert('test<span>test</span>', s.stripRegex(/<h1[^\n>]*>/, /<\/h1>/));
    assert('test<span>test</span>', s.stripRegex(/<h1[^\n>]*>/, '</h1>'));
    assert('<h1 class="simple">test<span>test</span></h1>', s.stripRegex(/<h1[^\n>]*>/, /<\/haaa1>/));
    
    s = new Noonworks.String('test <span>test</span>');
    assert(s, s.stripRegex(/<span[^\n>]*>/, /<\/span>/));
    s = new Noonworks.String('<span>test<span>test</span></span> test');
    assert(s, s.stripRegex(/<span[^\n>]*>/, /<\/span>/));
    
    s = new Noonworks.String('<span class="outer">test <span class="innger">test</span > test</span>');
    assert('test <span class="innger">test</span > test', s.stripRegex(/<span[^\n>]*>/, /<\/span>/));
    
    var sep = / /;
    s = new Noonworks.String('abc def  ghi   jkl');
    assert('abc', s.pickup(0, sep));
    assert('abc', s.pickup(1, sep));
    assert('abc', s.pickup(2, sep));
    assert('abc', s.pickup(3, sep));
    assert('def', s.pickup(4, sep));
    assert('def', s.pickup(5, sep));
    assert('def', s.pickup(6, sep));
    assert('def', s.pickup(7, sep));
    assert('',    s.pickup(8, sep));
    assert('ghi', s.pickup(9, sep));
    assert('ghi', s.pickup(10, sep));
    assert('ghi', s.pickup(11, sep));
    assert('ghi', s.pickup(12, sep));
    assert('',    s.pickup(13, sep));
    assert('',    s.pickup(14, sep));
    assert('jkl', s.pickup(15, sep));
    assert('jkl', s.pickup(16, sep));
    assert('jkl', s.pickup(17, sep));
    assert('jkl', s.pickup(18, sep));
    assert('',    s.pickup(19, sep));
    assert('',    s.pickup(20, sep));
    assert('jkl', s.pickup(-1, sep));
    assert('jkl', s.pickup(-2, sep));
    assert('jkl', s.pickup(-3, sep));
    assert('',    s.pickup(-4, sep));
    assert('',    s.pickup(-5, sep));
    assert('ghi', s.pickup(-6, sep));
    assert('ghi', s.pickup(-7, sep));
    assert('ghi', s.pickup(-8, sep));
    assert('ghi', s.pickup(-9, sep));
    assert('',    s.pickup(-10, sep));
    assert('def', s.pickup(-11, sep));
    assert('def', s.pickup(-12, sep));
    assert('def', s.pickup(-13, sep));
    assert('def', s.pickup(-14, sep));
    assert('abc', s.pickup(-15, sep));
    assert('abc', s.pickup(-16, sep));
    assert('abc', s.pickup(-17, sep));
    assert('abc', s.pickup(-18, sep));
    assert('',    s.pickup(-19, sep));
    assert('',    s.pickup(-20, sep));
    
    var s = new Noonworks.String('ABC "abc" ABC');
    assert('abc', s.pickup(5, '"', '"', true));
    var s = new Noonworks.String('ABC "abc ABC');
    assert('', s.pickup(5, '"', '"', true));
    var s = new Noonworks.String('ABC abc" ABC');
    assert('', s.pickup(5, '"', '"', true));
    
    var s = new Noonworks.String('a');
    assert('a', s.multiply(1));
    assert('aa', s.multiply(2));
    assert('aaa', s.multiply(3));
    assert('', s.multiply(0));
    assert('', s.multiply(-1));
    
    var e4_0 = 'function(){\n    abc;\n    def;\n    if(true){\n        ghi\n    }\n}';
    var e4_1 = '    function(){\n        abc;\n        def;\n        if(true){\n            ghi\n        }\n    }';
    var e4_2 = '        function(){\n            abc;\n            def;\n            if(true){\n                ghi\n            }\n        }';
    var s = new Noonworks.String(e4_0);
    assert(e4_0, s.indent(0));
    assert(e4_1, s.indent(1));
    assert(e4_2, s.indent(2));
    assert(e4_1, s.unindent(-1));
    assert(e4_2, s.unindent(-2));
    
    var e2_0 = 'function(){\n  abc;\n  def;\n  if(true){\n    ghi\n  }\n}';
    var e2_1 = '  function(){\n    abc;\n    def;\n    if(true){\n      ghi\n    }\n  }';
    var e2_2 = '    function(){\n      abc;\n      def;\n      if(true){\n        ghi\n      }\n    }';
    var s = new Noonworks.String(e2_0);
    assert(e2_0, s.indent(0, '  '));
    assert(e2_1, s.indent(1, '  '));
    assert(e2_2, s.indent(2, '  '));
    assert(e2_1, s.unindent(-1, '  '));
    assert(e2_2, s.unindent(-2, '  '));
    
    var s = new Noonworks.String(e4_2);
    assert(e4_2, s.unindent(0));
    assert(e4_1, s.unindent(1));
    assert(e4_0, s.unindent(2));
    assert(e4_1, s.indent(-1));
    assert(e4_0, s.indent(-2));
    
    var s = new Noonworks.String(e2_2);
    assert(e2_2, s.unindent(0, '  '));
    assert(e2_1, s.unindent(1, '  '));
    assert(e2_0, s.unindent(2, '  '));
    assert(e2_1, s.indent(-1, '  '));
    assert(e2_0, s.indent(-2, '  '));
    
    var eu_4 = '     function(){\n           abc;\n          def;\n        if(true){\n             ghi\n         }\n   }';
    var eu_3 = ' function(){\n       abc;\n      def;\n    if(true){\n         ghi\n     }\n}';
    var eu_2 = 'function(){\n   abc;\n  def;\nif(true){\n     ghi\n }\n}';
    var eu_1 = 'function(){\nabc;\ndef;\nif(true){\n ghi\n}\n}';
    var eu_0 = 'function(){\nabc;\ndef;\nif(true){\nghi\n}\n}';
    var s = new Noonworks.String(eu_4);
    assert(eu_4, s.unindent(0));
    assert(eu_3, s.unindent(1));
    assert(eu_2, s.unindent(2));
    assert(eu_1, s.unindent(3));
    assert(eu_0, s.unindent(4));
    
    var s = new Noonworks.String('abc def  ghi  jkl   mno  pqr');
    var arr1 = s.split(/ +/);
    assert(0,   s.pickupIndexOf(0, arr1));
    assert(0,   s.pickupIndexOf(1, arr1));
    assert(0,   s.pickupIndexOf(2, arr1));
    assert(0,   s.pickupIndexOf(3, arr1));
    assert(1,   s.pickupIndexOf(4, arr1));
    assert(1,   s.pickupIndexOf(5, arr1));
    assert(1,   s.pickupIndexOf(6, arr1));
    assert(1,   s.pickupIndexOf(7, arr1));
    assert(-1,  s.pickupIndexOf(8, arr1));
    assert(2,   s.pickupIndexOf(9, arr1));
    assert(2,   s.pickupIndexOf(10, arr1));
    assert(2,   s.pickupIndexOf(11, arr1));
    assert(2,   s.pickupIndexOf(12, arr1));
    assert(-1,  s.pickupIndexOf(13, arr1));
    assert(3,   s.pickupIndexOf(14, arr1));
    assert(3,   s.pickupIndexOf(15, arr1));
    assert(3,   s.pickupIndexOf(16, arr1));
    assert(3,   s.pickupIndexOf(17, arr1));
    assert(-1,  s.pickupIndexOf(18, arr1));
    assert(-1,  s.pickupIndexOf(19, arr1));
    assert(4,   s.pickupIndexOf(20, arr1));
    assert(4,   s.pickupIndexOf(21, arr1));
    assert(4,   s.pickupIndexOf(22, arr1));
    assert(4,   s.pickupIndexOf(23, arr1));
    assert(-1,  s.pickupIndexOf(24, arr1));
    assert(5,   s.pickupIndexOf(25, arr1));
    assert(5,   s.pickupIndexOf(26, arr1));
    assert(5,   s.pickupIndexOf(27, arr1));
    assert(5,   s.pickupIndexOf(28, arr1));
    assert(-1,  s.pickupIndexOf(29, arr1));
    assert(-1,  s.pickupIndexOf(30, arr1));
    var arr2 = s.split(' ');
    assert(0,   s.pickupIndexOf(0, arr2));
    assert(0,   s.pickupIndexOf(1, arr2));
    assert(0,   s.pickupIndexOf(2, arr2));
    assert(0,   s.pickupIndexOf(3, arr2));
    assert(1,   s.pickupIndexOf(4, arr2));
    assert(1,   s.pickupIndexOf(5, arr2));
    assert(1,   s.pickupIndexOf(6, arr2));
    assert(1,   s.pickupIndexOf(7, arr2));
    assert(-1,  s.pickupIndexOf(8, arr2));
    assert(3,   s.pickupIndexOf(9, arr2));
    assert(3,   s.pickupIndexOf(10, arr2));
    assert(3,   s.pickupIndexOf(11, arr2));
    assert(3,   s.pickupIndexOf(12, arr2));
    assert(-1,  s.pickupIndexOf(13, arr2));
    assert(5,   s.pickupIndexOf(14, arr2));
    assert(5,   s.pickupIndexOf(15, arr2));
    assert(5,   s.pickupIndexOf(16, arr2));
    assert(5,   s.pickupIndexOf(17, arr2));
    assert(-1,  s.pickupIndexOf(18, arr2));
    assert(-1,  s.pickupIndexOf(19, arr2));
    assert(8,   s.pickupIndexOf(20, arr2));
    assert(8,   s.pickupIndexOf(21, arr2));
    assert(8,   s.pickupIndexOf(22, arr2));
    assert(8,   s.pickupIndexOf(23, arr2));
    assert(-1,  s.pickupIndexOf(24, arr2));
    assert(10,  s.pickupIndexOf(25, arr2));
    assert(10,  s.pickupIndexOf(26, arr2));
    assert(10,  s.pickupIndexOf(27, arr2));
    assert(10,  s.pickupIndexOf(28, arr2));
    assert(-1,  s.pickupIndexOf(29, arr2));
    assert(-1,  s.pickupIndexOf(30, arr2));

    s = new Noonworks.String('My Mery utilities.');
    var r = /[\.\?\!]\s|[\t\n。！？\"]/;
    assert('My Mery utilities.', s.pickup(12, r, r, false).toString());

    var s = new Noonworks.String('abc abc abc abc');
    assert(0,  s.curIndexOf(0, 'abc'));
    assert(0,  s.curIndexOf(1, 'abc'));
    assert(0,  s.curIndexOf(2, 'abc'));
    assert(0,  s.curIndexOf(3, 'abc'));
    assert(-1, s.curIndexOf(3, 'cdb'));
    assert(-1, s.curIndexOf(4, 'cdb'));
    assert(4,  s.curIndexOf(4, 'abc'));
    assert(4,  s.curIndexOf(5, 'abc'));
    assert(4,  s.curIndexOf(6, 'abc'));
    assert(4,  s.curIndexOf(7, 'abc'));
    assert(8,  s.curIndexOf(8, 'abc'));
    assert(8,  s.curIndexOf(9, 'abc'));
    assert(8,  s.curIndexOf(10, 'abc'));
    assert(8,  s.curIndexOf(11, 'abc'));
})();
