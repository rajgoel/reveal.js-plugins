/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin allowing slides to use the full window size. 
**
** Version: 1.0.0
** 
** License: MIT license (see LICENSE.md)
**
******************************************************************/

window.RevealFullscreen = window.RevealFullscreen || {
    id: 'RevealFullscreen',
    init: function(deck) {
        initFullscreen(deck);
    }
};

const initFullscreen = function(Reveal){
	var config = null;
	var ready = false;

	Reveal.addEventListener( 'ready', function( event ) {
		ready = true;
		config = { width: Reveal.getConfig().width, height: Reveal.getConfig().height, margin: Reveal.getConfig().margin };
		if ( Reveal.getCurrentSlide().hasAttribute("data-fullscreen") ) {
			Reveal.configure( { width: window.innerWidth, height: window.innerHeight, margin: 0 } );
		}
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
		if ( ready && Reveal.getCurrentSlide().hasAttribute("data-fullscreen") ) {
			Reveal.configure( { width: window.innerWidth, height: window.innerHeight, margin: 0 } );
		}
	} );

};
