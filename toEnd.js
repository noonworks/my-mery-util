#title = "行末に移動"
// 行末に移動（すでに行末だった場合は次の行末まで移動）
(function(){
    var sel = Document.Selection;
    var tp = sel.GetTopPointX(mePosLogical);
    var bt = sel.GetBottomPointX(mePosLogical);
    var selecting_now = (tp != bt);
    var posX_v = sel.GetActivePointX(mePosView);
    sel.EndOfLine(selecting_now, mePosView);
    if (posX_v == sel.GetActivePointX(mePosView)) {
        sel.LineDown(selecting_now, 1);
        sel.EndOfLine(selecting_now, mePosView);
    }
})();
