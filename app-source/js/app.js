'use strict'

window.$ = window.jQuery = require( 'jquery' )

const path 				= require( 'path' )
const { app } 			= require( 'electron' ).remote
const { ipcRenderer } 	= require( 'electron' )
const { remote } 		= require( 'electron' )
const Store 			= require( 'electron-store' )
const store 			= new Store()
const loadJSON 			= require( 'load-json-file' )


const 	mainCanvas 		= document.getElementById( 'icon' ),
		mainContext 	= mainCanvas.getContext( '2d' ),
		previewCanvas 	= document.getElementById( 'preview' ),
		previewContext 	= previewCanvas.getContext( '2d' ),
		dropzone 		= $( '#dropzone' )



//note(@duncanmid): based on: fitImageOn by @sdqali
// https://sdqali.in/blog/2013/10/03/fitting-an-image-in-to-a-canvas-object/

function fitImageOn(canvas, context, theImageObj) {
	
	let imageAspectRatio = theImageObj.width / theImageObj.height,
		canvasAspectRatio = canvas.width / canvas.height,
		renderableHeight, renderableWidth, xStart, yStart
	
	if ( theImageObj.width < 1024 && theImageObj.height < 1024 ) {
	
		renderableWidth = theImageObj.width
		renderableHeight = theImageObj.height
		xStart = (canvas.width - renderableWidth) / 2
		yStart = (canvas.height - renderableHeight) / 2
	
	} else if ( imageAspectRatio < canvasAspectRatio ) {
		
		renderableHeight = canvas.height
		renderableWidth = theImageObj.width * (renderableHeight / theImageObj.height)
		xStart = (canvas.width - renderableWidth) / 2
		yStart = 0
	
	} else if ( imageAspectRatio > canvasAspectRatio ) {
		
		renderableWidth = canvas.width
		renderableHeight = theImageObj.height * (renderableWidth / theImageObj.width)
		xStart = 0
		yStart = (canvas.height - renderableHeight) / 2
	
	} else {
		
		renderableHeight = canvas.height
		renderableWidth = canvas.width
		xStart = 0
		yStart = 0
	}
	
	context.drawImage(theImageObj, xStart, yStart, renderableWidth, renderableHeight)
}



//note(@duncanmid): clear canvas

function clearCanvas() {
	
	mainContext.clearRect(0, 0, 1024, 1024)
	previewContext.clearRect(0, 0, 256, 256)
	
	$('#size').removeClass().empty()
	$('#preview-box').removeClass('active')
}


//note(@duncanmid): load image to canvas

function loadImage( src ) {

	let imageObj = new Image(),
		size = $('#size')
	
	imageObj.src = src
	
	imageObj.onload = function() {
		
		fitImageOn( mainCanvas, mainContext, imageObj )
		
		size.html(`original size: ${imageObj.width} × ${imageObj.height}px`)
		
		if( imageObj.width + imageObj.height < 2048 ) {
			
			size.addClass('alert')
			
			ipcRenderer.send('size', 'size')
		}
		
		ipcRenderer.send('valid', $('#icon')[0].toDataURL())
	}
}



//note(@duncanmid): set radio button type

function setType( type ) {
	
	$('input[name="type"][value="' + type + '"]').prop('checked', true).focus()
	$('.form table').hide()
	$(`table.icon-${type}`).show('fast')
}



//note(@duncanmid): drag and drop image

dropzone.on('dragover', function() {
	
	dropzone.addClass( 'hover' )
	return false
})



dropzone.on('dragleave', function() {
	
	dropzone.removeClass( 'hover' )
	return false
})



dropzone.on('drop', function(e) {
	
	e.stopPropagation()
	e.preventDefault()
	
	dropzone.removeClass( 'hover' )
	
	const 	imgTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp'],
			draggedType = e.originalEvent.dataTransfer.files[0].type
	
	if (imgTypes.includes(draggedType)) {
		
		clearCanvas()
		loadImage( e.originalEvent.dataTransfer.files[0]['path'] )
		
	} else {
		
		ipcRenderer.send('invalid', e.originalEvent.dataTransfer.files[0]['name'] )
	}
		
	return false
})


//note(@duncanmid): action on touch

ipcRenderer.on('touchButton', (event, message) => {
	
	if( $('input[name="type"]:checked').val() !== message ) {
	
		setType( message )
		
		store.set( 'iconType', message )
	}
})



ipcRenderer.on('touchbar-select', (event, message) => {
	
	setType( message )
	store.set( 'iconType', message )
})



ipcRenderer.on('delete', (event, message) => {
	
	clearCanvas()
	$('#generate').prop('disabled', true)
	
	ipcRenderer.send('deleted', 'deleted' )
})



ipcRenderer.on('load', (event, message) => {
	
	$('#generate').prop('disabled', false)
	loadImage( message )
})



ipcRenderer.on('preview', (event, message) => {
	
	let previewObj = new Image()
	
	previewObj.src = message
	
	previewObj.onload = function() {
		
		fitImageOn( previewCanvas, previewContext, previewObj )
		
		$('#preview-box').addClass('active')
		$('#generate').prop('disabled', false)
	}
})



//note(@duncanmid): generate .iconset

ipcRenderer.on('menu-generate', (event, message) => {
	
	if( !$('#generate').prop('disabled') ) {
	
		ipcRenderer.send('generate', $('input[name="type"]:checked').data( 'name' ) )
	}
})



$('#generate').click( function() { 
	
	ipcRenderer.send('generate', $('input[name="type"]:checked').data( 'name' ) )
})



//note(@duncanmid): docready

$( document ).ready( function() {
	
	let active = store.get( 'iconType' )
	
	loadJSON( path.join(__dirname, '../json/iconsets.json') ).then(json => {
		
		let buttons 	= [],
			count 	= 0
		
		for ( let type in json ) {
			
			let iconlist = [],
				state = (count == active) ? true : false;
			
			//todo(@duncanmid): send as object with state
			//buttons.push( type )
			
			buttons.push({
				
				'type': type,
				'state': state
			})
			
			$('.form').append( `<label><input type="radio" name="type" value="${count}" data-name="${type}" /> ${type}<table class="icon-${count}"></table></label>` )
			
			for ( let icon of json[type] ) {
				
				let row = `<tr><td>${icon.size}x${icon.size}px</td><td>@${icon.scale}x</td></tr>`
				
				if ( iconlist.includes( row ) === false ) {
					
					iconlist.push( row )
					$( `table.icon-${count}` ).append( row )
				}
			}
			
			count++
		}
		
		setType( active )
		
		ipcRenderer.send( 'touchbar', buttons )
	})
	
	
	$('body').on('click', 'input[name="type"]', function() {
		
		$( '.form table' ).hide()
		$( `.icon-${$(this).val()}` ).show( 'fast' )
		
		ipcRenderer.send('touchbar-index',  Number( $(this).val() ) )
		store.set( 'iconType', Number( $(this).val() ) )
	})
})
