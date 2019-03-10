'use strict'

const electron = require('electron')
const {Menu, shell} = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const name = app.getName()
var about = require('./about.min')



const template = [
	{
		label: name,
		submenu: [
			{
				label: 'About ' + name,
				click() { about.createAbout() }
			},
			{
				type: 'separator'
			},
			{
				label: 'Preferences…',
				accelerator: 'Command+,',
				click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('open-prefs') }
			},
			{
				type: 'separator'
			},
			{
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				role: 'hide'
			},
			{
				role: 'hideothers'
			},
			{
				role: 'unhide'
			},
			{
				type: 'separator'
			},
			{
				role: 'quit'
			}
		]
	},
	{
		label: 'Icon',
		submenu:
		[
			{
				label: 'Open image…',
				accelerator: 'Command+O',
				click () { app.emit('open', 'open') }
			},
			{
				label: 'Delete image',
				accelerator: 'Command+D',
				click (item, focusedWindow) {
					if(focusedWindow) focusedWindow.webContents.send('delete', 'delete')
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Generate Icon',
				accelerator: 'Command+G',
				click (item, focusedWindow) {
					if(focusedWindow) focusedWindow.webContents.send('menu-generate', 'generate')
				}
			}
		]  
	},
	/* {
		label: 'View',
		submenu:
		[
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click (item, focusedWindow) {
					if (focusedWindow) focusedWindow.reload()
				}
			},
			{
				label: 'Toggle Developer Tools',
				accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
				click (item, focusedWindow) {
					if (focusedWindow) focusedWindow.webContents.toggleDevTools()
				}
			}
		]
	}, */
	{
		role: 'window',
		submenu:
		[
			{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: 'Zoom',
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				label: 'Bring All to Front',
				role: 'front'
			}
		]
	},
	{
		role: 'help',
		submenu:
		[
			{
				label: 'midwinter-dg.com',
				click () { require('electron').shell.openExternal('https://www.midwinter-dg.com') }
			}
		]
	}
]


const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
