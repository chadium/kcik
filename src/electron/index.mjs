import path from 'path'
import { app, shell, ipcMain, BrowserWindow, Menu, screen } from 'electron'
import electronLocalshortcut from 'electron-localshortcut'
import { FileStorage } from './storage.mjs'
import { TheGreatReplacer } from './the-great-replacer.mjs'

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

    const title = this._makeTitle()
    const [width, height] = this._bestDefaultSize()

    this._win = new BrowserWindow({
      title,
      width: Math.floor(width * 0.666666),
      height: Math.floor(height * 0.666666),
      webPreferences: {
        preload: path.join(__dirname, '..', 'preload', 'index.js'),
        contextIsolation: false,

        // The API endpoints are not encrypted because we're not running a
        // bank here.
        allowRunningInsecureContent: process.env.NODE_ENV !== 'production'
      }
    })

    this._win.on('page-title-updated', (e) => {
      e.preventDefault()
    })

    this._win.loadURL('https://kirka.io/')

    this._registerShortcuts()
  }

  reload() {
    if (this._win === null) {
      // Not opened.
      return
    }

    this._win.reload()
  }

  restart() {
    this.close()
    this.open()
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

  menuClickSend(id) {
    this._win.webContents.send(`menu.${id}.click`)
  }

  _registerShortcuts() {
    electronLocalshortcut.register(this._win, "Escape", () => this.unlockPointer());
  }

  _bestDefaultSize() {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    return [width, height]
  }

  _makeTitle() {
    let text = 'Boomer Kirka Client ' + BOOMER_VERSION

    if (BOOMER_ADMIN) {
      text += ' (Admin)'
    }

    return text
  }
}

function buildMenu(wm) {
  let template = [
    {
      label: 'File',
      submenu: [
        {
          id: 'join-match',
          label: 'Join match',
          click: () => {
            wm.menuClickSend('join-match')
          }
        },
        {
          id: 'create-custom-match',
          label: 'Create custom match',
          click: () => {
            wm.menuClickSend('create-custom-match')
          }
        },
        { type: 'separator' },
        {
          label: 'Restart',
          accelerator: 'Ctrl+F5',
          click: () => {
            wm.restart()
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
          accelerator: 'F5',
          click: () => {
            wm.reload()
          }
        },
        {
          id: 'dev-tools',
          role: 'toggleDevTools'
        },
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

  if (BOOMER_ADMIN) {
    let tgr = new TheGreatReplacer({
      cacheStorage: new FileStorage({ prefix: 'url-cache' }),
      replaceStorage: new FileStorage({ prefix: 'url-1up' })
    })
  }

  let wm = new WinMan()

  let menu = buildMenu(wm)

  if (!BOOMER_ADMIN) {
    menu.getMenuItemById('create-custom-match').visible = false
    menu.getMenuItemById('dev-tools').visible = false
  }

  ipcMain.on('menu.join-match.enable', (e, state) => {
    menu.getMenuItemById('join-match').enabled = Boolean(state)
  })

  Menu.setApplicationMenu(menu)

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

  wm.open()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
