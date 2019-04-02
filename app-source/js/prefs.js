'use strict'

const {ipcRenderer} 		= require( 'electron' )
const remote 			= require( 'electron' ).remote
const Store 				= require( 'electron-store' )
const store 				= new Store()
const $ 					= require( 'jquery' )



ipcRenderer.on( 'prefs-select', ( event, message ) => {
	
	$( '#interpolation' ).val( message )
	
	store.set( 'interpolation', $( '#interpolation' ).find( ':selected' ).data( 'int' ) )
})



$( document ).ready( function() {
	
	let selected = store.get( 'interpolation' )
	
	$( `#interpolation option[data-int="${selected}"]` ).prop( 'selected', true )
	
	$( '#interpolation' ).on( 'change', function() {
		
		ipcRenderer.send( 'prefs-change', $( this ).val() )
		store.set( 'interpolation', $( this ).data( 'int' ) )
	})
	
	
	$( '#close' ).click( function() {
		
		const modal = remote.getCurrentWindow()
		modal.close()
	})
})
