const electron = require('electron');
// Module to control application life.
const {app, BrowserWindow, ipcMain} = electron;
// Module to create native browser window.

const path = require('path');
const url = require('url');
const dblite = require('dblite').withSQLite('3.8.6+');
const db = dblite('db.sqlite3');

function get_or_create_table(){
    var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='book';";
    db.query(query, function (err, rows) {
        if(!err){
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
get_or_create_table();


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'templates/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.webContents.openDevTools();

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
