/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for loading external content.
**
** Version: 0.1.0
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

"use strict";

window.RevealLoadContent = window.RevealLoadContent || {
  id: 'RevealLoadContent',
  init: function(deck) {
		function loadExternalContent( filename ) {
			return new Promise( function( resolve ) {
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function( filename, xhr ) {
					if( xhr.readyState === 4 ) {
						// file protocol yields status code 0 (useful for local debug, mobile applications etc.)
						if ( ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status === 0 ) {
							resolve( xhr.responseText );
						}
						else {
							let error = 'ERROR: The attempt to fetch ' + filename + ' failed with HTTP status ' + xhr.status + '. Check your browser\'s JavaScript console for more details.'
							console.error( error );
							resolve( '<div>' + error + '</div>' );
						}
					}
				}.bind( this, filename, xhr );
				xhr.open( 'GET', filename, true );

				try {
					xhr.send();
				}
				catch ( e ) {
					let error = 'Failed to get the external content from file ' + filename + '. Make sure that the presentation and the file are served by a HTTP(S) server and the file can be found there. ' + e;
					console.error( error );
					resolve( '<div>' + error + '</div>' );
				}
			} );
		};


		return new Promise( function( resolve ) {
			// Get names of files to be loaded
			var filenames = [];
			deck.getRevealElement().querySelectorAll( '[data-load]:not([data-loaded])').forEach( function( container, i ) {
				const filename = container.getAttribute("data-load");
				if ( !filenames.find(function(e) { return e == filename; }) ) {
					filenames.push(filename);
				}
			});

			// Load external files
			var externalPromises = [];
			filenames.forEach( function( filename, i ) {
				externalPromises.push( loadExternalContent( filename ).then(
					// Add content from external file
					function( response ) {
//console.log("Loaded",filename,response);
						deck.getRevealElement().querySelectorAll( '[data-load="' + filename + '"]:not([data-loaded])').forEach( function( container, i ) {
							container.innerHTML = response + container.innerHTML;
							container.setAttribute("data-loaded",true);
						});
					}
				) );
			});

			Promise.all( externalPromises ).then( resolve );
		});
  }
};


