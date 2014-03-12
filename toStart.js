#title = "行頭に移動"
// 行頭に移動
var go_prev_line = true;    // すでに先頭にいたとき前の行の行末に移動するか
var view_line = true;       // 折り返し行（表示行）の行頭に移動するか
var view_line_indent = true;// 折り返し行の行頭の空白をインデントとして扱うか
var indent = /^[ 　\t]+/;   // インデントの定義
(function(){
    var getToXView = function(line, nowX, ignore_indent) {
        if (ignore_indent) return 1;
        var m = line.match(indent);
        var toX = (m === null) ? 1 : (1 + m.lastIndex);
        return (toX < nowX) ? toX : 1;
    };
    var sel = Document.Selection;
    var tp = sel.GetTopPointX(mePosLogical);
    var bt = sel.GetBottomPointX(mePosLogical);
    var selecting_now = (tp != bt);
    var posX_l = sel.GetActivePointX(mePosLogical);
    var posY_l = sel.GetActivePointY(mePosLogical);
    var posX_v = sel.GetActivePointX(mePosView);
    var posY_v = sel.GetActivePointY(mePosView);
    if (posX_l == 1) {
        if (go_prev_line) {
            sel.LineUp(selecting_now, 1);
            if (posY_v != sel.GetActivePointY(mePosView)) {
                sel.EndOfLine(selecting_now, mePosView);
            }
        }
        return;
    }
    var toX_v = null;
    var toY_v = null;
    if (view_line && (posY_v > posY_l)) {
        if (posX_v > 1) {
            toX_v = getToXView(Document.GetLine(posY_v, meGetLineView), posX_v, (!view_line_indent));
            toY_v = posY_v;
        } else if (posY_v - posY_l > 1) {
            toX_v = getToXView(Document.GetLine(posY_v - 1, meGetLineView), 9999, (!view_line_indent));
            toY_v = posY_v - 1;
        }
    }
    if (toX_v === null) {
        toY_v = posY_l;
        var m = Document.GetLine(posY_l).match(indent);
        toX_v = (m === null) ? 1 : (1 + m.lastIndex);
        if (toX_v >= posX_l) toX_v = 1;
    }
    sel.SetActivePoint(mePosView, toX_v, toY_v, selecting_now);
})();
