const {ipcRenderer} = require('electron');
var remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const ipcMain = remote.ipcMain;
const url = require('url');
const path = require('path');
const dblite = require('dblite');
const db = dblite('db.sqlite3');
var window = remote.getCurrentWindow();

$(document).on('click', '#view-all', function () {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../templates/list.html'),
        protocol: 'file:',
        slashes: true
    }));
    var data = db.query('select * from book');

    window.close();
});

$(document).on('click', '#list-back-btn', function () {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../templates/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    window.close();
});

$(document).on('click', '#add-entry', function () {
    debugger;
    var title = $('[name="title"]').val();
    var author = $('[name="author"]').val();
    var topic = $('[name="topic"]').val();
    var year = $('[name="year"]').val();
    var isbn = $('[name="isbn"]').val();
    var sub_topic = $('[name="sub-topic"]').val();
    db.query('INSERT INTO book VALUES(1,?,?,?,?,?,?,?)', ['demo', title, author, topic, year, isbn, sub_topic]);

});
