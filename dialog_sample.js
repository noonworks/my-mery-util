#include "json2.js" // https://github.com/douglascrockford/JSON-js
#include "HTADialog.js"
/*

    HTADialog.js sample

*/

// create dialog
var dialog = new Noonworks.HTADialog('dialogs/sample_dialog.hta');

// data to send to dialog
var send_data = {
    test: 'hello! now is ' + (new Date()).toString()
};

// show dialog and get return value
var return_data = dialog.show(send_data);

// check and show return value
var s = '';
if (typeof(return_data) === 'string') {
    s = return_data;
} else if (typeof(return_data) === 'object') {
    for (var i in return_data) {
        if (typeof(return_data[i]) === 'object') {
            for (var j in return_data[i]) {
                s += i + '[' + j + ']:' + return_data[i][j] + '\n';
            }
        } else {
            s += i + ':' + return_data[i] + '\n';
        }
    }
} else {
    alert('ダイアログからの戻り値取得でエラーが発生しました。');
    quit();
}
alert('ダイアログからの戻り値\n----------\n' + s + '\n----------');


// color picker
var cp_dialog = new Noonworks.HTADialog('dialogs/colorpicker.hta');
var return_color = cp_dialog.show('#3355cc'); // default color
alert('ダイアログからの戻り値\n----------\n' + return_color + '\n----------');
