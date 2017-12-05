var remote = require('electron').remote;
var app = remote.app;
var path = require('path');
var dblite = require('dblite').withSQLite('3.8.6+');
var dbpath = path.join(app.getPath('userData'), 'db.sqlite3');
var db = dblite(dbpath);
var handlebar = require('handlebars');
var selectors = {
    title: $('[name="title"]'),
    author: $('[name="author"]'),
    topic: $('[name="topic"]'),
    year: $('[name="year"]'),
    isbn: $('[name="isbn"]'),
    sub_topic: $('[name="sub-topic"]')
};
var entry_model = '#entry-model';
var success_alert = $('#card-alert-success');
var error_alert = $('#card-alert-error');

function get_or_create_table() {
    var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='book';";
    db.query(query, function (err, rows) {
        if (rows.length < 1) {
            query = "CREATE TABLE book\n" +
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


$(document).on('click', '.update-data', function () {
    var id = $(this).data('id');
    db.query('SELECT * from book where id=' + id, function (err, rows) {
        selectors.title.val(rows[0][1]);
        selectors.author.val(rows[0][2]);
        selectors.topic.val(rows[0][3]);
        selectors.year.val(rows[0][4]);
        selectors.isbn.val(rows[0][5]);
        selectors.sub_topic.val(rows[0][6]);
        $(entry_model + ' .title').text('Update Book');
        $(entry_model + ' .successful-msg').text('Entry Updated Successfully');
        $(entry_model + ' [name="id"]').val(id);
        $('#add-entry').text('Update Entry');
        $(entry_model).modal('open');
        M.updateTextFields();
    });
});

$(document).on('click', '#add-entry', function () {
    var id = $(entry_model + ' [name="id"]').val();
    var title = selectors.title.val();
    var author = selectors.author.val();
    var topic = selectors.topic.val();
    var year = selectors.year.val();
    var isbn = selectors.isbn.val();
    var sub_topic = selectors.sub_topic.val();
    if (id) {
        if (title && author && topic && year && isbn && sub_topic) {
            db.query('UPDATE book SET title="' + title + '", author="' + author + '", topic="' + topic +
                '", year="' + year + '", isbn="' + isbn + '", sub_topic="' + sub_topic + '" where id=' + id + ';');
            error_alert.hide();
            success_alert.show();
            location.reload();
        }
        else {
            success_alert.hide();
            error_alert.show()
        }
    }
    else if (title && author && topic && year && isbn && sub_topic) {
        db.query('INSERT INTO book VALUES(null,?,?,?,?,?,?)', [title, author, topic, year, isbn, sub_topic]);
        error_alert.hide();
        success_alert.show();
        location.reload();
    }
    else {
        success_alert.hide();
        error_alert.show()
    }
});

function filterGlobal() {
    $('#datatable').DataTable().search(
        $('input#search').val()
    ).draw();
}

$(document).ready(function () {
    if ($('#list-template').length) {
        db.query('select * from book ORDER BY id DESC;', function (err, rows) {
            var source = document.getElementById("list-template").innerHTML;
            var template = handlebar.compile(source);
            var context = "";
            for (var i = 0; i < rows.length; i++) {
                context += template({
                    id: rows[i][0], counter: i + 1,
                    title: rows[i][1], author: rows[i][2],
                    topic: rows[i][3], year: rows[i][4],
                    isbn: rows[i][5], sub_topic: rows[i][6]
                });
            }
            $('tbody').html(context);
            $('#datatable').DataTable({
                "paging": false,
                "ordering": false
            });
            $('input#search').on('keyup click', function () {
                filterGlobal();
            });
        });
    }
    $(".alert .close").click(function () {
        $(this).closest(".alert").fadeOut("slow")
    });
    get_or_create_table();
    $('.modal').modal({
            dismissible: true,
            opacity: .5,
            startingTop: '20%',
            endingTop: '10%',
            complete: function () {
                $("#entry-form")[0].reset();
                $(entry_model + ' .title').text('Add New Book');
                $(entry_model + ' .successful-msg').text('New Entry added successfully');
                $(entry_model + ' [name="id"]').val('');
                $('#add-entry').text('Add Entry');
            }
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
