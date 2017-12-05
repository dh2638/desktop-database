var remote = require('electron').remote;
var BrowserWindow = remote.BrowserWindow;
var ipcMain = remote.ipcMain;
var app = remote.app;
var url = require('url');
var path = require('path');
var dblite = require('dblite').withSQLite('3.8.6+');
var dbpath = path.join(app.getPath('userData'), 'db.sqlite3');
var db = dblite(dbpath);
var window = remote.getCurrentWindow();
var handlebar = require('handlebars');
var selectors = {
    title: $('[name="title"]'),
    author: $('[name="author"]'),
    topic: $('[name="topic"]'),
    year: $('[name="year"]'),
    isbn: $('[name="isbn"]'),
    sub_topic: $('[name="sub-topic"]'),
};
var arr = ['title', 'author', 'topic', 'year', 'isbn', 'sub_topic'];
var success_alert = $('#card-alert-success');
var error_alert = $('#card-alert-error');
function get_or_create_table() {
    var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='book';";
    db.query(query, function (err, rows) {
        if (rows.length < 1) {
            query = "CREATE TABLE book\n" +sqlite_master
                "(\n" +
                "    id INTEGER PRIMARY KEY AUTOINCREMENT,\n" +
                "    title VARCHAR NOT NULL,\n" +
                "    author VARCHAR NOT NULL,\n" +
                "    topic VARCHAR NOT NULL,\n" +
                "    year VARCHAR NOT NULL,\n" +
                "    isbn VARCHAR NOT NULL,\n" +
                "    sub_topic VARCHAR NOT NULL\n" +
                ");";
            db.query(query, function (err, rows) {

            });
        }
    });
}


function openNewWindow(template_name, parameter) {
    var param = "";
    if (parameter)
        param = "?" + parameter;
    let win = new BrowserWindow({width: window.innerWidth, height: window.innerHeight});
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../templates/' + template_name + '.html'),
        protocol: 'file:',
        slashes: true
    }) + param);
    win.maximize();
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

function set_param() {
    var param = "";
    for (i = 0; i < arr.length; i++) {
        var value = selectors[arr[i]].val();
        if (value)
            param += arr[i] + "=" + value + "&"
    }
    return param
}

function get_search_query() {
    var query = "";
    var value = get_param_value('search');
    for (i = 0; i < arr.length; i++) {
        if (value && query)
            query += ' OR ' + arr[i] + ' LIKE "%' + value + '%" ';
        else if (value)
            query = arr[i] + ' LIKE "%' + value + '%" '
    }
    return query
}

$(document).on('click', '#view-all-btn', function () {
    openNewWindow('list',undefined)
});
$(document).on('click', '#add-new_entry-btn', function () {
    openNewWindow('add',undefined)
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
$(document).on('click', '#search-entry', function () {
    // var param = set_param();
    var param =  $('[name="search"]').val();
    openNewWindow('list', "search=" + param)
});
$(document).on('click', '.update-data', function () {
    var id = $(this).data('id');
    openNewWindow('update', "book=" + id);
});

$(document).on('click', '#add-entry', function () {
    var title = selectors.title.val();
    var author = selectors.author.val();
    var topic = selectors.topic.val();
    var year = selectors.year.val();
    var isbn = selectors.isbn.val();
    var sub_topic = selectors.sub_topic.val();
    if (title && author && topic && year && isbn && sub_topic) {
        db.query('INSERT INTO book VALUES(null,?,?,?,?,?,?)', [title, author, topic, year, isbn, sub_topic]);
        error_alert.hide();
        success_alert.show()
    }
    else {
        success_alert.hide();
        error_alert.show()
    }
});
$(document).ready(function () {
    if ($('#list-template').length) {
        var param = get_search_query();
        var search_query = "";
        if (param)
            search_query = 'WHERE (' + param + ');';
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
            selectors.title.val(rows[0][1]);
            selectors.author.val(rows[0][2]);
            selectors.topic.val(rows[0][3]);
            selectors.year.val(rows[0][4]);
            selectors.isbn.val(rows[0][5]);
            selectors.sub_topic.val(rows[0][6]);
            M.updateTextFields();
        })
    }
    $(".alert .close").click(function(){$(this).closest(".alert").fadeOut("slow")});
    get_or_create_table();
    $('.modal').modal({
            dismissible: true,
            opacity: .5,
            startingTop: '20%',
            endingTop: '10%',
        }
    );

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
    var title = selectors.title.val();
    var author = selectors.author.val();
    var topic = selectors.topic.val();
    var year = selectors.year.val();
    var isbn = selectors.isbn.val();
    var sub_topic = selectors.sub_topic.val();
    if (title && author && topic && year && isbn && sub_topic) {
        db.query('UPDATE book SET title="' + title + '", author="' + author + '", topic="' + topic +
            '", year="' + year + '", isbn="' + isbn + '", sub_topic="' + sub_topic + '" where id=' + id + ';');
        error_alert.hide();
        success_alert.show()
    }
    else {
        success_alert.hide();
        error_alert.show()
    }
});

