'use strict'

const i18n 				= require( './i18n.min' )
const electron 			= require( 'electron' )
const {Menu, shell} 	= require( 'electron' )
const app 				= electron.app
const name 				= app.getName()
const about 			= require( './about.min' )



const template = [
	{
		label: name,
		submenu: [
			{
				label: i18n.t('menu:app.about', 'About') + ` ${name}`,
				click() { about.createAbout() }
			},
			{
				type: 'separator'
			},
			{
				label: i18n.t('menu:app.preferences', 'Preferences…'),
				accelerator: 'Command+,',
				click () { app.emit('open-prefs', '') }
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
		label: i18n.t('menu:icon.icon', 'Icon'),
		submenu:
		[
			{
				label: i18n.t('menu:icon.open', 'Open image…'),
				accelerator: 'Command+O',
				click () { app.emit('open', 'open') }
			},
			{
				label: i18n.t('menu:icon.delete', 'Delete image'),
				accelerator: 'Command+D',
				click (item, focusedWindow) {
					if(focusedWindow) focusedWindow.webContents.send('delete', 'delete')
				}
			},
			{
				type: 'separator'
			},
			{
				label: i18n.t('menu:icon.generate', 'Generate Icon'),
				accelerator: 'Command+G',
				click (item, focusedWindow) {
					if(focusedWindow) focusedWindow.webContents.send('menu-generate', 'generate')
				}
			}
		]  
	},
	{
		label: i18n.t('menu:view.view', 'View'),
		submenu:
		[
			{
				label: i18n.t('menu:view.reload', 'Reload'),
				accelerator: 'CmdOrCtrl+R',
				click (item, focusedWindow) {
					if (focusedWindow) focusedWindow.reload()
				}
			},
			{
				label: i18n.t('menu:view.developer', 'Toggle Developer Tools'),
				accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
				click (item, focusedWindow) {
					if (focusedWindow) focusedWindow.webContents.toggleDevTools()
				}
			}
		]
	},
	{
		role: i18n.t('menu:window.window', 'window'),
		submenu:
		[
			{
				label: i18n.t('menu:window.close', 'Close'),
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
			{
				label: i18n.t('menu:window.minimize', 'Minimize'),
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: i18n.t('menu:window.zoom', 'Zoom'),
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				label: i18n.t('menu:window.front', 'Bring All to Front'),
				role: 'front'
			}
		]
	},
	{
		role: i18n.t('menu:help.help', 'help'),
		submenu:
		[
			{
				label: i18n.t('menu:help.homepage', 'Appiconset Generator Homepage'),
				click () { require('electron').shell.openExternal('https://www.midwinter-dg.com/mac-apps/appiconset-generator.html') }
			}
		]
	}
]


const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
