var remote = require('electron').remote;
var BrowserWindow = remote.BrowserWindow;
var ipcMain = remote.ipcMain;
var url = require('url');
var path = require('path');
var dblite = require('dblite');
var db = dblite('db.sqlite3');
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


function openNewWindow(template_name, parameter) {
    var param = "";
    if (parameter)
        param = "?" + parameter;
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../templates/' + template_name + '.html'),
        protocol: 'file:',
        slashes: true
    }) + param);
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

function get_param_query() {
    var query = "";
    for (i = 0; i < arr.length; i++) {
        var value = get_param_value(arr[i]);
        if (value && query)
            query += ' OR ' + arr[i] + ' LIKE "%' + value + '%" ';
        else if (value)
            query = arr[i] + ' LIKE "%' + value + '%" '
    }
    return query
}

$(document).on('click', '#view-all', function () {
    openNewWindow('list',)
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
    var param = set_param();
    openNewWindow('list', param)
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
        $('.alert.entry-danger').hide();
        $('.alert.entry').show()
    }
    else {
        $('.alert.entry').hide();
        $('.alert.entry-danger').show()
    }
});
$(document).ready(function () {
    if ($('#list-template').length) {
        var param = get_param_query();
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
    var title = selectors.title.val();
    var author = selectors.author.val();
    var topic = selectors.topic.val();
    var year = selectors.year.val();
    var isbn = selectors.isbn.val();
    var sub_topic = selectors.sub_topic.val();
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
