'use strict'

import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import '../renderer/store'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, chatWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 500,
    useContentSize: false,
    width: 500,
    frame: false,
    transparent: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
function createChatWindow () {
  /**
   * Initial window options
   */
  chatWindow = new BrowserWindow({
    height: 20,
    useContentSize: true,
    width: 260,
    frame: true,
    transparent: false
  })
  const chatPath = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/#/chatWindow'
    : `file://${__dirname}/index.html#chatWindow`
  chatWindow.setMenuBarVisibility(false)
  chatWindow.loadURL(chatPath)

  chatWindow.on('closed', () => {
    chatWindow = null
  })
}

ipcMain.on('createSettingWindow', function (arg) {
  createSettingWindow()
})
function createSettingWindow () {
  // Menu.setApplicationMenu(null) // 关闭子窗口菜单栏
  let settingWindow
  const modalPath = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/#/settingWindow'
    : `file://${__dirname}/index.html#settingWindow`
  // 使用hash对子页面跳转，这是vue的路由思想
  settingWindow = new BrowserWindow({
    height: 450,
    useContentSize: true,
    width: 450,
    frame: true,
    transparent: false,
    parent: mainWindow // mainWindow是主窗口
  })
  settingWindow.setMenuBarVisibility(false)
  settingWindow.loadURL(modalPath)

  settingWindow.on('closed', () => {
    mainWindow.webContents.send('did-close-fresh', 'refresh')
    if (chatWindow !== null) {
      chatWindow.webContents.send('setchat-close-fresh', 'refresh')
    }
    settingWindow = null
  })
}
app.on('ready', () => {
  createWindow()
  createChatWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
