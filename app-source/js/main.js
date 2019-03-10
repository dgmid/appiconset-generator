'use strict'

const { app, BrowserWindow, TouchBar, ipcMain } = require( 'electron' )
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

const url 		= require( 'url' ) 
const path 		= require( 'path' )
const fs 		= require( 'fs-extra' )
const sharp 	= require( 'electron-sharp' )
const dialog 	= require( 'electron' ).dialog
const Store 	= require( 'electron-store' )
const util 		= require( 'util' )
const loadJSON 	= require( 'load-json-file' )

let win,
	tempString,
	appIdentifier = 'com.midwinter-dg.' + app.getName().toLowerCase().replace(' ', '-'),
	tempDir = app.getPath( 'temp' ) + `${appIdentifier}/`,
	touchBar,
	buttons = []



let store = new Store({
	defaults: {
		
		windowBounds: {
			x: 0,
			y: 0
		},
		
		iconType: 		'macOS',
		interpolation: 'lanczos3',
		savePath: 		app.getPath( 'desktop' )
	}
})



function createWindow() {
	
	let { x, y, width, height } = store.get('windowBounds')
	
	win = new BrowserWindow({
		show: false,
		titleBarStyle: 'hiddenInset',
		x: x,
		y: y,
		width: 820,
		height: 620,
		transparent: true,
		frame: false,
		resizable: false,
		maximizable: false,
		fullscreen: false,
		icon: path.join(__dirname, '../assets/icon/Icon.icns')
	})
	
	win.setSheetOffset( 32 )
	
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
	
	for ( let type of message ) {
	
		buttons.push(
			
			new TouchBarButton({
			
				label: type,
				backgroundColor: '#7F37C5',
				click: () => {
				
					win.webContents.send( 'touch', type )
				}
			})
		)
	}
	
	buttons.push(
		
		new TouchBarSpacer({ size: 'small' })
	)
	
	
	buttons.push(
	
		new TouchBarButton({
			
			label: 'Generate Appiconset',
			backgroundColor: '#3B88FD',
			click: () => {
				
				win.webContents.send('menu-generate', 'generate')
			}
		})
	)
	
	touchBar = new TouchBar( buttons )
	
	win.setTouchBar( touchBar )
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
