'use strict'

const i18n = require( './i18n.min' )

const $ = require( 'jquery' )
const jqueryI18next = require( 'jquery-i18next' )
jqueryI18next.init(i18n, $)

const {ipcRenderer}		= require( 'electron' )
const remote			= require( 'electron' ).remote
const Store				= require( 'electron-store' )
const store				= new Store()



//note(@duncanmid): set lang & localize strings

$('html').attr('lang', i18n.language)
$('header').localize()
$('label').localize()
$('option[data-int="nearest"]').localize()
$('option[data-int="cubic"]').localize()
$('option[data-int="mitchell"]').localize()
$('option[data-int="lanczos2"]').localize()
$('option[data-int="lanczos3"]').localize()
$('#close').localize()


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
