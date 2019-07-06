'use strict'

const i18n 				= require( './i18n.min' )
const { app } = require( 'electron' )
const dialog 	= require( 'electron' ).dialog

app.on( 'open', ( message ) => {
	
	dialog.showOpenDialog(win, {
			
			defaultPath: app.getPath('home'),
			buttonLabel: i18n.t('app:dialog.open.button', 'Choose Image'),
			filters: [
				{ name: 'Images', extensions: ['png', 'jpg', 'gif', 'bmp'] },
			],
			properties: [
				'openFile'
			],
			message: i18n.t('app:dialog.open.message', 'The file must be one of the following types: .png, .jpg, .gif, .bmp')
		},		
		
		loadImage
	)
	
	
	function loadImage( filename ) {
		
		if( filename ) {
			
			win.webContents.send( 'load', filename )
		}
	}
})
