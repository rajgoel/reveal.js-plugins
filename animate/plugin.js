/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for animating slide content.
**
** Version: 0.1.0
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

window.RevealAnimate = window.RevealAnimate || {
    id: 'RevealAnimate',
    init: function(deck) {
        initAnimate(deck);
    },
    play: function() { play(); },
    pause: function() { pause(); },
    seek: function(timestamp) { seek(timestamp); },
};

const initAnimate = function(Reveal){
	var playback = false;
	var isRecording = false;
	var timer = null;
	var initialized = 0;

	function parseJSON(str) {
	    str = str.replace(/(\r\n|\n|\r|\t)/gm,""); // remove line breaks and tabs
	    var json;
	    try {
        	json = JSON.parse(str, function (key, value) {
    			if (value && (typeof value === 'string') && value.indexOf("function") === 0) {
			        // we can only pass a function as string in JSON ==> doing a real function
//			        eval("var jsFunc = " + value);
				var jsFunc = new Function('return ' + value)();
			        return jsFunc;
		 	}
			return value;
		});
	    } catch (e) {
        	return null;
    		}
            return json;
	}

	function load( element, config, filename, callback ) {
		var xhr = new XMLHttpRequest(); 
		xhr.onload = function() { 
			if (xhr.readyState === 4) { 
				callback( element, config, xhr.responseText );
			} 
			else { 
				callback( "Failed to get file. ReadyState: " + xhr.readyState + ", Status: " + xhr.status );
			}
		}; 
		xhr.open( 'GET', filename, true ); 
		xhr.send();
	}

	function parseComments( element ) {
		var config = {};
		var comments = element.innerHTML.trim().match(/<!--[\s\S]*?-->/g);
//console.log(comments)
		if ( comments !== null ) for (var k = 0; k < comments.length; k++ ){
			comments[k] = comments[k].replace(/<!--/,'');
			comments[k] = comments[k].replace(/-->/,'');
			var config = parseJSON(comments[k]);
//console.warn(comments[k], config);

			if ( config ) {
				if ( config.animation && Array.isArray(config.animation) && config.animation.length && !Array.isArray(config.animation[0]) ) {
					// without fragments the animation can be specified as a single array (animation steps)
					config.animation = [ config.animation ];
				}
				break;
			}
		}

//console.warn(element, config);
		return config;
	}

	function getAnimatedSVG( container ) {
		var elements = SVG.find('svg');
		var svg = elements.toArray().find(element => element.node.parentElement == container);
//console.warn("FOUND",svg.node);
		return svg;
	}

/*****************************************************************
** Set up animations
******************************************************************/
	function setupAnimations( container, config ) {
//console.warn("setupAnimations");
		if ( !config ) return;

		container.svg = getAnimatedSVG( container );

		// pre-animation setup
		var setup = config.setup;
		if ( setup ) {
			for (var i = 0; i < setup.length; i++ ){
				try {
					if ( setup[i].element ) {
//console.log(setup[i].element,setup[i].modifier,setup[i].parameters);
						var elements = container.svg.find(setup[i].element);
						if ( !elements.length ) {
console.warn("Cannot find element to set up with selector: " + setup[i].element + "!");
						}

//console.warn(elements);
//console.log("element(" + setup[i].element + ")." + setup[i].modifier + "(" + setup[i].parameters + ")");
//console.log("element(" + setup[i].element + ")." + setup[i].modifier + "(" + setup[i].parameters + ")");
						for (var j = 0; j < elements.length; j++ ){
							if ( typeof setup[i].modifier === "function" ) {
								// if modifier is function execute it
								setup[i].modifier.apply(elements[j],setup[i].parameters);
							}
							else {
								// apply modifier to element
								elements[j][setup[i].modifier].apply(elements[j],setup[i].parameters);
							}
						}

					}
					else {
						// no element is provided
						if ( typeof setup[i].modifier === "function" ) {
							// if modifier is function execute it
							setup[i].modifier.apply(container.svg,setup[i].parameters);
						} 
						else {
							// apply modifier to root
							container.svg[setup[i].modifier].apply(container.svg,setup[i].parameters);
						}
					}				
				} 
				catch( error ) {
					console.error("Error '" + error + "' setting up element " + JSON.stringify(setup[i]));
				}
			}
//console.warn(container.svg.node.getAttribute("style"));
		}

		container.animation = new SVG.Timeline().persist(true);
		container.animationSchedule = []; // completion time of each fragment animation

		// setup animation
		var animations = config.animation;
		if ( animations ) {

			container.animationSchedule.length = animations.length;
			var timestamp = 0;
			for (var fragment = 0; fragment < animations.length; fragment++ ){
				container.animationSchedule[fragment] = {};
				container.animationSchedule[fragment].begin = timestamp;
				for (var i = 0; i < animations[fragment].length; i++ ){
					try {
						// add each animation step
						var elements = container.svg.find(animations[fragment][i].element);
//console.log("element(" + animations[fragment][i].element + ")." + animations[fragment][i].modifier + "(" + animations[fragment][i].parameters + ")");
						if ( !elements.length ) {
							console.warn("Cannot find element to animate with selector: " + animations[fragment][i].element + "!");
						}
						for (var j = 0; j < elements.length; j++ ){
							elements[j].timeline( container.animation );
							var anim = elements[j].animate(animations[fragment][i].duration,animations[fragment][i].delay,animations[fragment][i].when)
							anim[animations[fragment][i].modifier].apply(anim,animations[fragment][i].parameters);
						}

//console.log("Duration:", anim.duration());
						timestamp = anim.duration();
					} 
					catch( error ) {
						console.error("Error '" + error + "' setting up animation " + JSON.stringify(animations[fragment][i]));
					}
				}
				// set animationSchedule for each fragment animation
				var schedule = container.animation.schedule();
				if ( schedule.length ) {
					timestamp = schedule[schedule.length-1].end;
				}
				container.animationSchedule[fragment].end = timestamp;
			}
			container.animation.stop();
//console.warn(container.animation.schedule());
// console.warn("Schedule", container.animationSchedule);
		}

		// setup current slide
		if ( Reveal.getCurrentSlide().contains( container ) ) {
			Reveal.layout(); // Update layout to account for svg size
			animateSlide(0);
		}

		initialized += 1;
	}

	function initialize() {
//console.log("Initialize animations");
		// Get all animations
		var elements = document.querySelectorAll("[data-animate]");
		for (var i = 0; i < elements.length; i++ ){
			var config = parseComments( elements[i] );
			var src = elements[i].getAttribute("data-src");
			if ( src ) {
				var element = elements[i];
				load( elements[i], config, src, function( element, config, response ) {
					if ( printMode ) {
						// do not load svg multiple times
						element.removeAttribute("data-src")
					}
					element.innerHTML = response + element.innerHTML;
					setupAnimations( element, config );
				});
			}
			else {
				setupAnimations( elements[i], config );
			}
		}
	}


	function play() {
//console.log("Play",Reveal.getCurrentSlide());
		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");
		for (var i = 0; i < elements.length; i++ ){
//console.warn("Play",elements[i]);
			elements[i].animation.play();
		}
		autoPause();
	}

	function pause() {
//console.log("Pause");
		if ( timer ) { clearTimeout( timer ); timer = null; }

		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");
		for (var i = 0; i < elements.length; i++ ){
			if ( elements[i].animation ) {
				elements[i].animation.pause();
			}
		}
	}

	function autoPause() {

		if ( timer ) { clearTimeout( timer ); timer = null; }
		var fragment = Reveal.getIndices().f + 1 || 0; // in reveal.js fragments start with index 0, here with index 1



		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");

		for (var i = 0; i < elements.length; i++ ){
			if ( elements[i].animation && elements[i].animationSchedule[fragment] ) {
//console.log( elements[i].animationSchedule[fragment].end, elements[i].animation.time());
				var timeout = elements[i].animationSchedule[fragment].end - elements[i].animation.time();
				timer = setTimeout(pause,timeout);
			}
//console.log("Auto pause",elements[i], timeout);
		}

	}

	function seek( timestamp ) {
//console.log("Seek", timestamp);
		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");
		var fragment = Reveal.getIndices().f + 1 || 0; // in reveal.js fragments start with index 0, here with index 1
		for (var i = 0; i < elements.length; i++ ){
//console.log("Seek",timestamp,elements[i].animationSchedule[fragment].begin + (timestamp || 0) );
			if ( elements[i].animation && elements[i].animationSchedule[fragment] ) {
				elements[i].animation.time( elements[i].animationSchedule[fragment].begin + (timestamp || 0) );
			}
		}
		if ( timer ) { 
			// update time if animation is running
			autoPause();
		}
	}

	
	// Control animation
	function animateSlide( timestamp ) {
//		pause();
//console.log("Animate slide", timestamp);
		if ( timestamp !== undefined ) {
			seek( timestamp);
		}
		if ( Reveal.isAutoSliding() || playback || isRecording ) {
//console.log("Start animation");
			play();
		}
		else {
			pause();
		}
//console.log("Done");
	}
	
/*****************************************************************
** Print
******************************************************************/
	var printMode = ( /print-pdf/gi ).test( window.location.search );
//console.log("createPrintout" + printMode)

	function initializePrint( ) {
//return;
//console.log("initializePrint", document.querySelectorAll(".pdf-page").length);
		if ( !document.querySelectorAll(".pdf-page").length ) {
			// wait for pdf pages to be created
			setTimeout( initializePrint, 500 );
			return;
		}
		initialize();
		createPrintout();
	}

	function createPrintout( ) {
//console.log("createPrintout", document.querySelectorAll(".pdf-page").length, document.querySelectorAll("[data-animate]").length );
		if ( initialized < document.querySelectorAll("[data-animate]").length ) {
//console.log("wait");
			// wait for animations to be loaded
			setTimeout( createPrintout, 500 );
			return;
		}
		var pages = document.querySelectorAll(".pdf-page");
		for ( var i = 0; i < pages.length; i++ ) {
			var fragment = -1;
			var current = pages[i].querySelectorAll(".current-fragment");
			for ( var j = 0; j < current.length; j++ ) {
				if ( Number(current[j].getAttribute("data-fragment-index")) > fragment ) {
					fragment = Number(current[j].getAttribute("data-fragment-index") );				
				}
			}
			fragment += 1;
			var elements = pages[i].querySelectorAll("[data-animate]");
			for ( var j = 0; j < elements.length; j++ ) {
//console.log(i,fragment, elements[j]);

				if ( elements[j].animation && elements[j].animationSchedule && elements[j].animationSchedule[fragment] ) {
//console.log(i,fragment, elements[j].animationSchedule[fragment].begin);
					elements[j].animation.time( elements[j].animationSchedule[fragment].end );
				}
				var fragments = elements[j].querySelectorAll("svg > [data-fragment-index]");
//console.log(i,fragment, elements[j], fragments);
				for ( var k = 0; k < fragments.length; k++ ) {
					if ( fragments[k].getAttribute("data-fragment-index") < fragment ) {
						fragments[k].classList.add("visible");
					}
				}
			}			
		}
	}
/*****************************************************************
** Event listeners
******************************************************************/

	Reveal.addEventListener( 'ready', function( event ) {
//console.log('ready ');
/*
		if ( printMode ) {
			initializePrint();
			return;
		}
*/
		initialize();

		if ( printMode ) {
			initializePrint();
			return;
		}

		Reveal.addEventListener('slidechanged', function(){
//console.log('slidechanged',Reveal.getIndices());
			animateSlide(0);
		});

		Reveal.addEventListener( 'overviewshown', function( event ) {
			// pause animation
			pause();
		} );

/*
		Reveal.addEventListener( 'overviewhidden', function( event ) {
		} );
*/
		Reveal.addEventListener( 'paused', function( event ) {
//console.log('paused ');
			// pause animation
			pause();
		} );
/*
		Reveal.addEventListener( 'resumed', function( event ) {
console.log('resumed ');
			// resume animation
		} );
*/
		Reveal.addEventListener( 'fragmentshown', function( event ) {
//console.log("fragmentshown",event);
			animateSlide(0);
		} );

		Reveal.addEventListener( 'fragmenthidden', function( event ) {
//console.log("fragmentshown",event);
			animateSlide(0);
		} );
	} );


/*****************************************************************
** Playback
******************************************************************/

	document.addEventListener('seekplayback', function( event ) {
//console.log('event seekplayback ' + event.timestamp);
		// set animation to event.timestamp
		animateSlide(event.timestamp);
	});


	document.addEventListener('startplayback', function( event ) {
//console.log('event startplayback ' + event.timestamp);
		playback = true;
		animateSlide(event.timestamp);
	});

	document.addEventListener('stopplayback', function( event ) {
//console.log('event stopplayback ', event);
		playback = false;
		animateSlide();
	});

	document.addEventListener('startrecording', function( event ) {
//console.log('event startrecording ' + event.timestamp);
		isRecording = true;
		animateSlide(0);
	});

	document.addEventListener('stoprecording', function( event ) {
//console.log('event stoprecording ' + event.timestamp);
		isRecording = false;
		animateSlide();
	});

	this.play = play; 
	this.pause = pause; 
	this.seek = seek; 
	return this;
};


