const { createWindow } = require('./main');
const { app } = require('electron')
const path = require('path')

// Database Module
require('./database')

// Electron reload for updatin in each change
if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    })
}

app.whenReady().then(createWindow)