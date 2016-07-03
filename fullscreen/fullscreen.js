/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js allowing slides to use the full window
** size. 
**
** Version: 0.1
** 
** License: MIT license (see LICENSE.md)
**
******************************************************************/

var RevealFullscreen= window.RevealFullscreen || (function(){

	var config = null;

	Reveal.addEventListener( 'ready', function( event ) {
		config = { width: Reveal.getConfig().width, height: Reveal.getConfig().height, margin: Reveal.getConfig().margin };
	} );

	Reveal.addEventListener( 'slidechanged', function( event ) {
		if ( Reveal.getCurrentSlide().hasAttribute("data-fullscreen") ) {
			Reveal.configure( { width: window.innerWidth, height: window.innerHeight, margin: 0 } );
		}
		else {
			Reveal.configure( config );
		}
	} );

	window.addEventListener( 'resize', function( event ) {
		if ( Reveal.getCurrentSlide().hasAttribute("data-fullscreen") ) {
			Reveal.configure( { width: window.innerWidth, height: window.innerHeight, margin: 0 } );
		}
	} );

})();
