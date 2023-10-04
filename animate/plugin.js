/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for animating slide content.
**
** Version: 0.2.0
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

"use strict";

window.RevealAnimate = window.RevealAnimate || {
    id: 'RevealAnimate',
    init: function(deck) {
        initAnimate.call(this,deck);
    },
    play: function() { play(); },
    pause: function() { pause(); },
    seek: function(timestamp) { seek(timestamp); },
};

const initAnimate = function(Reveal){
	if ( document.querySelector('section[data-markdown]:not([data-markdown-parsed])')
		   || document.querySelector('[data-load]:not([data-loaded])')
	) {
		// wait for other plugins to parse markdown and load external content
		setTimeout(initAnimate, 100,Reveal);
		return;
	}

	var config = Reveal.getConfig().animate || {};
	var autoplay = config.autoplay;

	var playback = false;
	var isRecording = false;
	var timer = null;
	var animatedSVGs = [];

	var printMode = ( /print-pdf/gi ).test( window.location.search );

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

	function parseComments( element ) {
		var config = {};
		var comments = element.innerHTML.trim().match(/<!--[\s\S]*?-->/g);
//console.log(comments)
		if ( comments !== null ) for (var k = 0; k < comments.length; k++ ){
			comments[k] = comments[k].replace(/<!--/,'');
			comments[k] = comments[k].replace(/-->/,'');
			var config = parseJSON(comments[k]);
//console.warn(comments[k], config);

			if ( config && typeof config === 'object' ) {
				if ( config.animation && Array.isArray(config.animation) && config.animation.length && !Array.isArray(config.animation[0]) ) {
					// without fragments, the animation can be specified as a single array (animation steps)
					config.animation = [ config.animation ];
				}
				break;
			}
		}

//console.warn(element, config);
		return config;
	}


/*****************************************************************
** Set up animations
******************************************************************/
	function setupAnimations( index, container, config ) {
//console.warn("setupAnimations",container,config);
		container.setAttribute("data-animation-index",index);
		animatedSVGs.push({ svg: SVG( container.querySelector('svg') ) });
//console.log(animatedSVGs);
		if ( !config ) return;
		
//		container.svg = SVG( container.querySelector('svg') );
		// pre-animation setup
		var setup = config.setup;
//console.log(animatedSVGs[index].svg,setup);
		if ( setup ) {
			for (var i = 0; i < setup.length; i++ ){
				try {
					if ( setup[i].element ) {
//console.log(setup[i].element,setup[i].modifier,setup[i].parameters);
						var elements = animatedSVGs[index].svg.find(setup[i].element);
						if ( !elements.length ) {
							console.warn("Cannot find element to set up with selector: " + setup[i].element + "!");
						}

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
							setup[i].modifier.apply(animatedSVGs[index].svg,setup[i].parameters);
						} 
						else {
							// apply modifier to root
							animatedSVGs[index].svg[setup[i].modifier].apply(animatedSVGs[index].svg,setup[i].parameters);
						}
					}				
				} 
				catch( error ) {
					console.error("Error '" + error + "' setting up element " + JSON.stringify(setup[i]));
				}
			}
//console.warn(animatedSVGs[index].svg.node.getAttribute("style"));
		}

		animatedSVGs[index].animation = new SVG.Timeline().persist(true);
		animatedSVGs[index].animationSchedule = []; // completion time of each fragment animation

		// setup animation
		var animations = config.animation;
		if ( animations ) {

			animatedSVGs[index].animationSchedule.length = animations.length;
			var timestamp = 0;
			for (var fragment = 0; fragment < animations.length; fragment++ ){
				animatedSVGs[index].animationSchedule[fragment] = {};
				animatedSVGs[index].animationSchedule[fragment].begin = timestamp;
				for (var i = 0; i < animations[fragment].length; i++ ){
					try {
						// add each animation step
						var elements = animatedSVGs[index].svg.find(animations[fragment][i].element);
//console.log("element(" + animations[fragment][i].element + ")." + animations[fragment][i].modifier + "(" + animations[fragment][i].parameters + ")");
						if ( !elements.length ) {
							console.warn("Cannot find element to animate with selector: " + animations[fragment][i].element + "!");
						}
						for (var j = 0; j < elements.length; j++ ){
							elements[j].timeline( animatedSVGs[index].animation );
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
				var schedule = animatedSVGs[index].animation.schedule();
				if ( schedule.length ) {
					timestamp = schedule[schedule.length-1].end;
				}
				animatedSVGs[index].animationSchedule[fragment].end = timestamp;
			}
			animatedSVGs[index].animation.stop();
		}

		// setup current slide
		if ( Reveal.getCurrentSlide().contains( container ) ) {
			Reveal.layout(); // Update layout to account for svg size
			animateSlide(0);
		}
	}

	function initialize() {
//console.log("Initialize animations");
		// Get all animations
		var elements = document.querySelectorAll("[data-animate]");
		for (var i = 0; i < elements.length; i++ ){
			if ( elements[i].hasAttribute("data-src") ) {
				console.error("Animations no longer support 'data-src'! Use 'loadcontent' plugin instead.");
			}
			var config = parseComments( elements[i] );
			setupAnimations( i, elements[i], config );
		}
	}


	function play() {
//console.log("Play",Reveal.getCurrentSlide());
		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");
		for (var i = 0; i < elements.length; i++ ){
//console.warn("Play",elements[i]);
			const index = elements[i].getAttribute("data-animation-index");
			if ( animatedSVGs[index].animation ) {
				animatedSVGs[index].animation.play();
			}
		}
		autoPause();
	}

	function pause() {
//console.log("Pause");
		if ( timer ) { clearTimeout( timer ); timer = null; }

		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");
		for (var i = 0; i < elements.length; i++ ){
			const index = elements[i].getAttribute("data-animation-index");
			if ( animatedSVGs[index].animation ) {
				animatedSVGs[index].animation.pause();
			}
		}
	}

	function autoPause() {

		if ( timer ) { clearTimeout( timer ); timer = null; }
		var fragment = Reveal.getIndices().f + 1 || 0; // in reveal.js fragments start with index 0, here with index 1



		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");

		for (var i = 0; i < elements.length; i++ ){
			const index = elements[i].getAttribute("data-animation-index");
			if ( animatedSVGs[index].animation
			     && animatedSVGs[index].animationSchedule[fragment] 
			) {
//console.log( animatedSVGs[index].animationSchedule[fragment].end, animatedSVGs[index].animation.time());
				var timeout = animatedSVGs[index].animationSchedule[fragment].end - animatedSVGs[index].animation.time();
				timer = setTimeout(pause,timeout);
			}
//console.log("Auto pause",animatedSVGs[index], timeout);
		}

	}

	function seek( timestamp ) {
//console.log("Seek", timestamp);
		var elements = Reveal.getCurrentSlide().querySelectorAll("[data-animate]");
		var fragment = Reveal.getIndices().f + 1 || 0; // in reveal.js fragments start with index 0, here with index 1
		for (var i = 0; i < elements.length; i++ ){
			const index = elements[i].getAttribute("data-animation-index");
//console.log("Seek",timestamp,animatedSVGs[index].animationSchedule[fragment].begin + (timestamp || 0) );
			if ( animatedSVGs[index].animation
				   && animatedSVGs[index].animationSchedule[fragment] 
			) {
				animatedSVGs[index].animation.time( animatedSVGs[index].animationSchedule[fragment].begin + (timestamp || 0) );
			}
		}
		if ( timer ) { 
			// update time if animation is running
			autoPause();
		}
	}

	
	// Control animation
	function animateSlide( timestamp ) {
		if ( printMode ) return;

//		pause();
//console.log("Animate slide", timestamp);
		if ( timestamp !== undefined ) {
			seek( timestamp);
		}
		if ( Reveal.isAutoSliding() || autoplay || playback || isRecording ) {
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
//console.log("createPrintout" + printMode)

	function setupPrintout( ) {
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
				const index = elements[j].getAttribute("data-animation-index");
//console.log(pages[i],fragment, elements[j]);

				// set visibility for fragments
				var fragments = elements[j].querySelectorAll("svg [data-fragment-index]");
//console.log(i,fragment, elements[j], fragments);
				for ( var k = 0; k < fragments.length; k++ ) {
					if ( fragments[k].getAttribute("data-fragment-index") < fragment ) {
						fragments[k].classList.add("visible");
					}
				}

				// set animation timestamp
				if ( animatedSVGs[index].animation 
				     && animatedSVGs[index].animationSchedule 
				     && animatedSVGs[index].animationSchedule[fragment] 
				) {
//console.log(i,fragment, elements[j].animationSchedule[fragment].begin);
					animatedSVGs[index].animation.time( animatedSVGs[index].animationSchedule[fragment].end );
				}

				// remove HTML comments to fix problems with printing in Chrome
				elements[j].innerHTML = elements[j].innerHTML.replace(/<\!--.*?-->/g, "");
			}			
		}
	}
/*****************************************************************
** Event listeners
******************************************************************/
	Reveal.addEventListener( 'pdf-ready', function( event ) {
//console.log('pdf-ready ',event);
		initialize();
		setupPrintout();
  }, { once: true });

	if ( !printMode ) {
		Reveal.addEventListener( 'ready', function( event ) {
//console.log('ready ');
			initialize();

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
	}

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



