#title = "NPostfixCompletion"

var Noonworks = Noonworks || {};

Noonworks._pickupAround = function(text, index, reg) {
  var w = ['', ''];
  // add global option to regexp
  var f_i = reg.ignoreCase ? 'i' : '';
  var f_m = reg.multiline ? 'm' : '';
  var reg_g = new RegExp(reg.source, [f_i, f_m, 'g'].join(''));
  // after caret
  var s = text.substring(index, text.length);
  var m = s.match(reg);
  if (m !== null && m.index == 0) {
    w[1] = m[0];
  }
  // before caret
  var s = text.substring(0, index);
  var m = s.match(reg_g);
  if (m !== null) {
    var pat = m[m.length - 1];
    if (s.substring(s.length - pat.length, s.length) == pat) {
      w[0] = pat;
    }
  }
  return {text: w.join(''), posStart: index - w[0].length, posEnd: index + w[1].length};
};

Noonworks.ComplationResult = function(succeed, original, posStart, posEnd, complation){
  this.succeed = succeed;
  this.original = original;
  this.posStart = posStart;
  this.posEnd = posEnd;
  this.complation = complation;
};
Noonworks.ComplationResult.prototype = {
  replace: function() {
    return this.original.substring(0, this.posStart) + this.complation
      + this.original.substring(this.posEnd, this.original.length);
  }
};
//                                                                                                                                                                
//   ||||      ||     ||||
// abc\tdef\t\t\\t\ttab\t
Noonworks.TabComplation = function(){};
Noonworks.TabComplation.prototype = {
  run: function(text, index) {
    if (index < 0) {
      var rep = text.replace(/\\t/g, '\t');
      return new Noonworks.ComplationResult((rep != text), text, 0, text.length, rep);
    }
    var p = Noonworks._pickupAround(text, index, /[\\tT]+/);
    var rep = p.text.replace(/\\t/g, '\t');
    return new Noonworks.ComplationResult((rep != p.text), text, p.posStart, p.posEnd, rep);
  }
};

Noonworks.NPostfixCompletion = function(){
  if (Document.Selection.IsEmpty) {
    this.posY = Document.Selection.GetActivePointY(mePosLogical);
    this.text = Document.GetLine(this.posY, 0).replace('\n', '');
    this.index = Document.Selection.GetActivePointX(mePosLogical) - 1;
  } else {
    this.text = Document.Selection.Text;
    this.index = -1;
  }
  this.complations = [new Noonworks.TabComplation()];
};
Noonworks.NPostfixCompletion.prototype = {
  run: function() {
    for (var i = 0; i < this.complations.length; i++) {
      var ret = this.complations[i].run(this.text, this.index);
      if (ret.succeed) {
        return ret;
      }
    }
    return null;
  },
  replace: function(complationResult) {
    if (! complationResult.succeed) {
      return false;
    }
    if (this.index >= 0) {
      Document.Selection.SetActivePoint(mePosLogical, complationResult.posStart + 1, this.posY);
      Document.Selection.SetAnchorPoint(mePosLogical, complationResult.posEnd + 1, this.posY);
    }
    Document.Selection.Text = complationResult.complation;
    return true;
  }
};

(function(){
  Status = '';
  var c = new Noonworks.NPostfixCompletion();
  var ret = c.run();
  if (ret === null) {
    Status = 'NPC: Nothing is suggested.';
  } else {
    var succeed = c.replace(ret);
    if (succeed) {
      Status = 'NPC: Replace succeeded.';
    } else {
      Status = 'NPC: Replace ERROR.';
    }
  }
})();
