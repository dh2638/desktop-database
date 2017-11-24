const {ipcRenderer} = require('electron');
var remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const ipcMain = remote.ipcMain;
const url = require('url');
const path = require('path');
const dblite = require('dblite');
const db = dblite('db.sqlite3');
var window = remote.getCurrentWindow();
var handlebar = require('handlebars');

function openNewWindow(template_name, parameter) {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../templates/' + template_name + '.html'),
        protocol: 'file:',
        slashes: true
    }) + "?" + parameter);
    window.close();
}

function get_param_value(param) {
    var sPageURL = location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == param) {
            return sParameterName[1];
        }
    }
}

$(document).on('click', '#view-all', function () {
    openNewWindow('list', undefined)
});

$(document).on('click', '#update-back-btn', function () {
    openNewWindow('list', undefined)
});

$(document).on('click', '#list-back-btn', function () {
    openNewWindow('index', undefined)
});

$(document).on('click', '#search-back-btn', function () {
    openNewWindow('index', undefined)
});
$(document).on('click', '#search-btn', function () {
    openNewWindow('search', undefined)
});
$(document).on('click', '.update-data', function () {
    var id = $(this).data('id');
    openNewWindow('update', "book=" + id);
});

$(document).on('click', '#add-entry', function () {
    var title = $('[name="title"]').val();
    var author = $('[name="author"]').val();
    var topic = $('[name="topic"]').val();
    var year = $('[name="year"]').val();
    var isbn = $('[name="isbn"]').val();
    var sub_topic = $('[name="sub-topic"]').val();
    if (title && author && topic && year && isbn && sub_topic) {
        db.query('INSERT INTO book VALUES(null,?,?,?,?,?,?)', [title, author, topic, year, isbn, sub_topic]);
        $('.alert.entry-danger').hide()
        $('.alert.entry').show()
    }
    else {
        $('.alert.entry').hide();
        $('.alert.entry-danger').show()
    }
});
$(document).ready(function () {
    if ($('#list-template').length) {
        var search = get_param_value('search');
        var search_query = ""
        if (search) {
            search_query = 'WHERE (id LIKE "%' + search + '%" OR title LIKE "%' + search + '%" OR author LIKE "%' + search + '%" OR topic LIKE "%' + search + '%" OR year LIKE "%' + search + '%" OR isbn LIKE "%' + search + '%" OR sub_topic LIKE "%' + search + '%");';
        }
        var query = 'select * from book ' + search_query;
        var data = db.query('select * from book ' + search_query, function (err, rows) {
            var source = document.getElementById("list-template").innerHTML;
            var template = handlebar.compile(source);
            var context = "";
            for (i = 0; i < rows.length; i++) {
                context += template({
                    id: rows[i][0], counter: i + 1,
                    title: rows[i][1], author: rows[i][2],
                    topic: rows[i][3], year: rows[i][4],
                    isbn: rows[i][5], sub_topic: rows[i][6]
                });
            }
            $('tbody').html(context);
        });
    }
    if ($('#update-page').length) {
        var id = get_param_value('book');
        db.query('SELECT * from book where id=' + id, function (err, rows) {
            $('[name="title"]').val(rows[0][1]);
            $('[name="author"]').val(rows[0][2]);
            $('[name="topic"]').val(rows[0][3]);
            $('[name="year"]').val(rows[0][4]);
            $('[name="isbn"]').val(rows[0][5]);
            $('[name="sub-topic"]').val(rows[0][6]);
        })
    }
});


$(document).on('click', '#delete-selected', function () {
    var values = [];
    $('input[type="checkbox"]:checked').each(function (i, v) {
        values.push($(v).val());
    });
    var query = 'DELETE FROM book WHERE id IN (' + values + ')';
    db.query(query);
    location.reload();

});

$(document).on('click', '#update-data-btn', function () {
    var id = get_param_value('book');
    var title = $('[name="title"]').val();
    var author = $('[name="author"]').val();
    var topic = $('[name="topic"]').val();
    var year = $('[name="year"]').val();
    var isbn = $('[name="isbn"]').val();
    var sub_topic = $('[name="sub-topic"]').val();
    if (title && author && topic && year && isbn && sub_topic) {
        db.query('UPDATE book SET title="' + title + '", author="' + author + '", topic="' + topic +
            '", year="' + year + '", isbn="' + isbn + '", sub_topic="' + sub_topic + '" where id=' + id + ';');
        $('.alert.entry-danger').hide();
        $('.alert.entry').show()
    }
    else {
        $('.alert.entry').hide();
        $('.alert.entry-danger').show()
    }
});

$(document).on('click', '#search-data-btn', function () {
    var search = $('[name="search"]').val();
    openNewWindow('list', 'search=' + search);
});