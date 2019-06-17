'use strict'

const { app, BrowserWindow, TouchBar, ipcMain } = require( 'electron' )
const { TouchBarButton, TouchBarSpacer, TouchBarSegmentedControl } = TouchBar

const url 		= require( 'url' ) 
const path 		= require( 'path' )
const fs 		= require( 'fs-extra' )
const sharp 		= require( 'electron-sharp' )
const dialog 	= require( 'electron' ).dialog
const Store 		= require( 'electron-store' )
const util 		= require( 'util' )
const loadJSON 	= require( 'load-json-file' )



let win,
	modal,
	tempString,
	appIdentifier = 'com.midwinter-dg.' + app.getName().toLowerCase().replace(' ', '-'),
	tempDir = app.getPath( 'temp' ) + `${appIdentifier}/`,
	touchBar1,
	touchBar2,
	prefsTouchBar,
	group,
	groupPrefs,
	buttons = [],
	generate = [],
	prefsButtons = []



let store = new Store({
	defaults: {
		
		windowBounds: {
			x: 0,
			y: 0
		},
		
		iconType: 		0,
		interpolation: 	'lanczos3',
		savePath: 		app.getPath( 'desktop' )
	}
})



function createWindow() {
	
	let { x, y, width, height } = store.get('windowBounds')
	
	win = new BrowserWindow({
		show: false,
		titleBarStyle: 'hidden',
		x: x,
		y: y,
		width: 820,
		height: 620,
		transparent: true,
		resizable: false,
		maximizable: false,
		fullscreen: false,
		webPreferences: {
			//{ devTools: false },
			preload: path.join(__dirname, './preload.min.js')
		},
		icon: path.join(__dirname, '../assets/icon/Icon.icns')
	})
	
	win.setSheetOffset( 23 )
	
	function saveWindowBounds() {
		
		store.set( 'windowBounds', win.getBounds() )
	}
	
	win.loadURL(url.format ({ 
		
		pathname: path.join(__dirname, '../html/app.html'), 
		protocol: 'file:', 
		slashes: true 
	}))
	
	win.once('ready-to-show', () => {
		
		win.show()
		empty()
	})
	
	win.on( 'resize', saveWindowBounds )
	win.on( 'move', saveWindowBounds )
	
	win.on('closed', () => {
		
		app.quit()
		empty()
	})
	
	require( './menu-app.min' )
	
}

app.on( 'ready', createWindow )



function empty() {
	
	fs.emptyDir( tempDir, err => {
		
		if( err ) {
			
			return console.error( err )
		}
	})
}



app.on( 'open', ( message ) => {
	
	dialog.showOpenDialog(win, {
			
			defaultPath: app.getPath('home'),
			buttonLabel: 'Choose Image',
			filters: [
				{ name: 'Images', extensions: ['png', 'jpg', 'gif', 'bmp'] },
			],
			properties: [
				'openFile'
			],
			message: 'The file must be one of the following types: .png, .jpg, .gif, .bmp'
		},		
		
		loadImage
	)
	
	
	function loadImage( filename ) {
		
		if( filename ) {
			
			win.webContents.send( 'load', filename )
		}
	}
})



ipcMain.on( 'touchbar', ( event, message ) => {
	
	let segments = [],
		spacer,
		count = 0,
		selected = 0
	
	for ( let item of message ) {
		
		segments.push({ label: item.type })
		
		if( item.state ) selected = count
		
		count++
	}
	
	spacer 	= new TouchBarSpacer({ size: 'small' })
	group 	= new TouchBarSegmentedControl({
		
		segmentStyle: 'separated',
		mode: 'single',
		segments: segments,
		selectedIndex: selected,
		change: ( selectedIndex ) => {
			
			win.webContents.send( 'touchbar-select', selectedIndex )
		}
	})
	
	buttons.push( group )
	generate.push( group )
	buttons.push( spacer )
	generate.push( spacer )
	
	generate.push(
	
		new TouchBarButton({
			
			label: 'Generate Appiconset',
			backgroundColor: '#3B88FD',
			click: () => {
				
				win.webContents.send( 'menu-generate', 'generate' )
			}
		})
	)
	
	touchBar1 = new TouchBar( buttons )
	win.setTouchBar( touchBar1 )
})


ipcMain.on( 'touchbar-index', ( event, message ) => {
	
	group.selectedIndex = message
})



ipcMain.on( 'size', ( event, message ) => {
	
	dialog.showMessageBox( win, {
							type: 'info',
							message: `Image too small`,
							detail: `For best results the image must be at least\n1024 x 1024px`,
							buttons: ['OK']
						})
})



ipcMain.on( 'valid', ( event, message ) => {
	
	let data 	= message.replace(/^data:image\/\w+;base64,/, ''),
		buffer 	= Buffer.from(data, 'base64')
		
	tempString = Date.now()
	
	fs.ensureDir( `${tempDir}/${tempString}/`, err => {
		
		if( err ) {
			
			return console.error( err )
		}
		
		fs.writeFile( `${tempDir}/${tempString}.png`, buffer, function( err ) {
			
			if( err ) {
				
				return console.error( err )
			}
			
			win.webContents.send( 'preview', `${tempDir}/${tempString}.png` )
			
			touchBar2 = new TouchBar( generate )
			win.setTouchBar( touchBar2 )
		})	
	})
})



ipcMain.on( 'invalid', ( event, message ) => {
	
	dialog.showMessageBox( win, {
							type: 'error',
							message: `Invalid file format`,
							detail: `${message} is not a valid image file.\nThe file must be one of the following types: .png, .jpg, .gif, .bmp`,
							buttons: ['OK']
						})
})



ipcMain.on( 'generate', ( event, message ) => {
	
	fs.emptyDirSync( `${tempDir}/${tempString}/` )
	
	let interpolation = store.get( 'interpolation' ),
	image = sharp( `${tempDir}/${tempString}.png` ),
	Contents = {
					"images" : [],
					"info" : {
						"version" : 1,
						"author" : appIdentifier
					}
				}
	
	loadJSON( path.join(__dirname, '../json/iconsets.json') ).then(json => {
		
		let iconlist = []
		
		for( let item of json[message] ) {
			
			let actualPixels = item.size * item.scale,
				filename = `icon_${item.size}x${item.size}@${item.scale}x.png`
			
			if ( iconlist.includes( filename ) === false ) {
				
				iconlist.push( filename )
				
				image
					.resize(actualPixels, actualPixels, {
					kernel: sharp['kernel'][interpolation],
					fit: 'contain',
					position: 'left top'
				})
				.toFile( `${tempDir}/${tempString}/${filename}` )
				.then(() => {
					
					console.info( `generated ${item.size} - @${item.scale}x` )
				})
	
	
				Contents.images.push({
						"size" : `${item.size}x${item.size}`,
						"idiom" : item.idiom,
						"filename" : filename,
						"scale" : `${item.scale}x`
				})
			}
		}
		
		fs.writeJson( `${tempDir}/${tempString}/Contents.json`, Contents, {
				spaces: '\t'
			}, 
			
			function( err ) {
			
			if ( err ) return console.error( err )
			
			saveIconsetToPath( `${tempDir}/${tempString}` )
		})
	})
})



ipcMain.on( 'deleted', ( event, message ) => {
	
	touchBar1 = new TouchBar( buttons )
	win.setTouchBar( touchBar1 )
})



function saveIconsetToPath( message ) {
	
	let savePath =  store.get( 'savePath' )
	
	dialog.showSaveDialog( win, {
			
			defaultPath: savePath + '/AppIcon.appiconset',
			buttonLabel: 'Save Appiconset'
		},		
		
		function( filename ) {
			
			if( filename ) {
			
				fs.copy( message, filename, err => {
					
					if ( err ) return console.error( err )
					
					console.info( 'success!' )
				})
			}
		}
	)
}



app.on( 'open-prefs', (message) => {
	
	let ind
	
	switch( store.get( 'interpolation' ) ) {
		
		case 'cubic': 		ind = 1
		break;
		
		case 'mitchell': 	ind = 2
		break;
		
		case 'lanczos2': 	ind = 3
		break;
		
		case 'lanczos3': 	ind = 4
		break;
		
		default: 			ind = 0
	}
	
	groupPrefs = new TouchBarSegmentedControl({
	
		segmentStyle: 'separated',
		mode: 'single',
		segments: [
			{ label: 'Nearest Neighbour' },
			{ label: 'Cubic' },
			{ label: 'Mitchell' },
			{ label: 'Lanczos a=2' },
			{ label: 'Lanczos a=3' }
		],
		selectedIndex: ind,
		change: ( selectedIndex ) => {
			
			modal.webContents.send( 'prefs-select', selectedIndex )
		}
	})
	
	prefsButtons.push( groupPrefs )
	
	prefsButtons.push(
		
		new TouchBarButton({
			
			label: 'Close',
			backgroundColor: '#3B88FD',
			click: () => {
				
				modal.close()
			}
		})
	)
	
	prefsTouchBar = new TouchBar( prefsButtons )
	
	modal = new BrowserWindow({
	
		parent: win,
		modal: true,
		width: 360,
		minWidth: 360,
		maxWidth: 360,
		height: 210,
		minHeight: 210,
		resizable: false,
		show: false,
		transparent: true,
		webPreferences: {
			//{ devTools: false },
			preload: path.join(__dirname, './preload.min.js')
		}
	})
	
	modal.loadURL(url.format ({ 
		
		pathname: path.join(__dirname, '/../html/prefs.html'), 
		protocol: 'file:', 
		slashes: true 
	}))
	
	modal.setTouchBar( prefsTouchBar )
	
	modal.once('ready-to-show', () => {
		
		modal.show()
	})
})



ipcMain.on( 'prefs-change', ( event, message ) => {
	
	groupPrefs.selectedIndex = parseInt(message)
})
