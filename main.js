// Modules to control application life and create native browser window
const {app, BrowserWindow, session, dialog, protocol, net, ipcMain} = require('electron')
const path = require('path')
const log = require('electron-log/main');
const url = require('url')
const { NsisUpdater } = require("electron-updater")

log.initialize();
log.transports.file.archiveLogFn = function archiveLog(file) {
  file = file.toString();
  const info = path.parse(file);
  
  try {
    fs.renameSync(file, path.join(info.dir, info.name + '.old' + info.ext));
  } catch (e) {
    console.warn('Could not rotate log', e);
  }
}
log.transports.file.maxSize = 10000


const options = {
  requestHeaders: {
      // Any request headers to include here
  },
  provider: 'generic',
  url: 'http://localhost:8080'
}

const autoUpdater = new NsisUpdater(options)
autoUpdater.checkForUpdatesAndNotify()
autoUpdater.on('update-available', () => {
  dialog.showErrorBox('有更新可以用了')
})

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  ipcMain.on('getTutorialUrl', () => {
    console.log('2234')
  })
}

app.setAsDefaultProtocolClient('foobar');
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'ffdra',
    privileges: {
        stream: true,
    }
  }
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  session.defaultSession.webRequest.onHeadersReceived({urls: [`*://*/secretapi/login`]}, (details, callback) => {
    global.console.log('details=>', details)
    callback({ responseHeaders: {...details.responseHeaders, a: 'haha'}, test: 'textContent' });
    })
  
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    log.info(`[listener:second-instance] ${commandLine} | ${workingDirectory}`)
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // the commandLine is array of strings in which last element is deep link url
    dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop()}`)
    console.log('Welcome Back', `You arrived from: ${url}`)
  })


  // Create mainWindow, load the rest of the app, etc...
  // app.whenReady().then(() => {
  //   createWindow()
  // })
}

app.on('open-url', (event, url) => {
  dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  log.info(`[listener:open-url] ${url}`)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
