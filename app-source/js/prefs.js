'use strict'

const {ipcRenderer} 	= require( 'electron' )
const remote 			= require( 'electron' ).remote
const Store 			= require( 'electron-store' )
const store 			= new Store()
const $ 				= require( 'jquery' )



//note(@duncanmid): close modal

function closeModal() {
	
	const modal = remote.getCurrentWindow()
	modal.close()
}



$( document ).ready( function() {
	
	$( '#interpolation' ).val( store.get( 'interpolation' ) )
	
	
	$( '#interpolation' ).on( 'change', function() {
		
		store.set( 'interpolation', $( this ).val() )
	})
	
	//note(@duncanmid): cancel modal
	
	$( '#close' ).click( function() {
		
		closeModal()
	})
})
