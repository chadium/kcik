const path = require('path')
const { app, shell, ipcMain, BrowserWindow, Menu } = require('electron')
const electronLocalshortcut = require('electron-localshortcut')
const { FileStorage } = require('./storage')
const { TheGreatReplacer } = require('./the-great-replacer')
require('./dotenv')

const isMac = process.platform === 'darwin'

class WinMan {
  constructor() {
    this._win = null
  }

  open() {
    if (this._win !== null) {
      // Already opened.
      return
    }

    this._win = new BrowserWindow({
      width: 1280,
      height: 720,
      titleBarStyle: 'hidden',
      titleBarOverlay: true,
      webPreferences: {
        preload: path.join(__dirname, '..', 'dist', 'preload', 'index.js'),
        contextIsolation: false,

        // The API endpoints are not encrypted because we're not running a
        // bank here.
        allowRunningInsecureContent: true
      }
    })

    this._win.loadURL('https://kirka.io/')

    this._registerShortcuts()
  }

  reload() {
    if (this._win === null) {
      // Not opened.
      return
    }

    this._win.loadURL('https://kirka.io/')
  }

  close() {
    if (this._win === null) {
      // Not opened.
      return
    }

    this._win.close()

    this._win = null
  }

  unlockPointer() {
    if (this._win === null) {
      // Not opened.
      return
    }

    this._win.webContents.executeJavaScript('document.exitPointerLock()', true)
  }

  load(url) {
    if (this._win === null) {
      // Not opened.
      return
    }

    this._win.loadURL(url)
  }

  joinMatch() {
    this._win.webContents.send('join-match')
  }

  createCustomMatch() {
    this._win.webContents.send('create-custom-match')
  }

  _registerShortcuts() {
    electronLocalshortcut.register(this._win, "Escape", () => this.unlockPointer());
    electronLocalshortcut.register(this._win, 'Ctrl+R', () => {
      this.reload()
    });
    electronLocalshortcut.register(this._win, 'F5', () => {
      this._win.reload()
    });
    electronLocalshortcut.register(this._win, '`', () => {
      this._win.webContents.send('toggle-score')
    });
    electronLocalshortcut.register(this._win, '=', () => {
      this._win.webContents.send('toggle-score2')
    });
  }
}

function buildMenu(wm) {
  let template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Join match',
          click: () => {
            wm.joinMatch()
          }
        },
        {
          label: 'Create custom match',
          click: () => {
            wm.createCustomMatch()
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          click: () => {
            wm.reload()
          }
        },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Website',
          click: async () => {
            await shell.openExternal('https://the28yearoldboomer.com')
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}

async function main() {
  await app.whenReady()

  let tgr = new TheGreatReplacer({
    cacheStorage: new FileStorage({ prefix: 'url-cache' }),
    replaceStorage: new FileStorage({ prefix: 'url-1up' })
  })

  let wm = new WinMan()

  Menu.setApplicationMenu(buildMenu(wm))

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (isMac) {
    app.on('activate', () => {
      wm.open()
    })
  }

  ipcMain.on('join-match', (e, data) => {
    if (data.startsWith('https://kirka.io/games/')) {
      wm.load(data)
    }
  })

  wm.open()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
