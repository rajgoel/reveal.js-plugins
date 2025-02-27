/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js allowing to  automatically play audio
** files for a slide deck. After an audio file has completed
** playing the next slide or fragment is automatically shown and
** the respective audio file is played. If no audio file is
** available, a blank audio file with default  duration is played
** instead.
**
** Version: 1.1.1
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

window.RevealAudioSlideshow = window.RevealAudioSlideshow || {
    id: 'RevealAudioSlideshow',
    init: function(deck) {
        initAudioSlideshow(deck);
    },
    toggleAutoAdvance: function() { return toggleAutoAdvance(); },
};

const initAudioSlideshow = function(Reveal){
	// default parameters
	var prefix = "audio/";
	var suffix = ".webm";
	var textToSpeechURL = null; // no text to speech converter
//	var textToSpeechURL = "http://localhost/?key=[YOUR_KEY]&hl=en-gb&c=ogg&src="; // the text to speech converter
	var defaultNotes = false; // use slide notes as default for the text to speech converter
	var defaultText = false; // use slide text as default for the text to speech converter
	var defaultDuration = 5; // value in seconds
	var defaultPlaybackRate = 1.0; // default speed of audio
	var currentPlaybackRate = 1.0; // current speed of audio
	var defaultAudios = true; // try to obtain audio for slide and fragment numbers
	var advance = 0; // advance to next slide after given time in milliseconds after audio has played, use negative value to not advance
	var autoplay = false; // automatically start slideshow
	var playerOpacity = .05; // opacity when the mouse is far from to the audioplayer
	var startAtFragment = false; // when moving to a slide, start at the current fragment or at the start of the slide
	var playerStyle = "position: fixed; bottom: 4px; left: 25%; width: 50%; height:75px; z-index: 33;"; // style used for container of audio controls
	// ------------------

	var silence;
	var currentAudio = null;
	var previousAudio = null;
	var timer = null;
	var defaultAdvance = 0;

	Reveal.addEventListener( 'fragmentshown', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
//console.debug( "fragmentshown ");
		selectAudio();
	} );

	Reveal.addEventListener( 'fragmenthidden', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
//console.debug( "fragmenthidden ");
		selectAudio();
	} );

	Reveal.addEventListener( 'ready', function( event ) {
		setup();
//console.debug( "ready ");
		selectAudio();
		document.dispatchEvent( new CustomEvent('stopplayback') );

	} );

	Reveal.addEventListener( 'slidechanged', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
//console.debug( "slidechanged ");
		var indices = Reveal.getIndices();
		if ( !startAtFragment && typeof indices.f !== 'undefined' && indices.f >= 0) {
			// hide fragments when slide is shown
			Reveal.slide(indices.h, indices.v, -1);
		}

		selectAudio();
	} );

	Reveal.addEventListener( 'paused', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
		if ( currentAudio ) { currentAudio.pause(); }
	} );

	Reveal.addEventListener( 'resumed', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
	} );

	Reveal.addEventListener( 'overviewshown', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
		if ( currentAudio ) { currentAudio.pause(); }
		document.querySelector(".audio-controls").style.visibility = "hidden";
	} );

	Reveal.addEventListener( 'overviewhidden', function( event ) {
		if ( timer ) { clearTimeout( timer ); timer = null; }
		document.querySelector(".audio-controls").style.visibility = "visible";
	} );

	Reveal.addKeyBinding( { keyCode: 65, key: 'A', description: 'Toggle audio' }, function() {
		if ( currentAudio ) {
			if ( timer ) { clearTimeout( timer ); timer = null; }
			currentAudio.paused ? currentAudio.play() : currentAudio.pause();
		}
	} );

	function toggleAutoAdvance() {
		if ( autoplay ) {
			if ( currentAudio ) {
				if ( timer ) { clearTimeout( timer ); timer = null; }
				currentAudio.pause();
                        }
			autoplay = false;
			advance = -1;
		}
		else {
			if ( currentAudio && currentAudio.paused ) currentAudio.play();
			autoplay = true;
			advance = defaultAdvance;
		}
		return autoplay;
	}

	Reveal.addKeyBinding( { keyCode: 160, key: '^', description: 'Toggle audio autoadvance' }, toggleAutoAdvance );

	function selectAudio( previousAudio ) {
		if ( currentAudio ) {
			currentAudio.pause();
			currentAudio.style.display = "none";
		}
		var indices = Reveal.getIndices();
		var id = "audioplayer-" + indices.h + '.' + indices.v;
		if ( indices.f != undefined && indices.f >= 0 ) id = id + '.' + indices.f;
		currentAudio = document.getElementById( id );
		if ( currentAudio ) {
			currentAudio.style.display = "block";
			if ( previousAudio ) {
				if ( currentAudio.id != previousAudio.id ) {
					currentAudio.volume = previousAudio.volume;
					currentAudio.muted = previousAudio.muted;
//console.debug( "Play " + currentAudio.id);
					currentAudio.play();
				}
			}
			else if ( autoplay ) {
				currentAudio.play();
			}

		}
	}


	function setup() {
		// wait for markdown and highlight plugin to be done
		if (
			document.querySelector( 'section[data-markdown]:not([data-markdown-parsed])' )
			|| document.querySelector( 'code[data-line-numbers*="|"]')
		) {
			setTimeout( setup, 100 );
			return;
		}

		// set parameters
		var config = Reveal.getConfig().audio;
		if ( config ) {
			if ( config.prefix != null ) prefix = config.prefix;
			if ( config.suffix != null ) suffix = config.suffix;
			if ( config.textToSpeechURL != null ) textToSpeechURL = config.textToSpeechURL;
			if ( config.defaultNotes != null ) defaultNotes = config.defaultNotes;
			if ( config.defaultText != null ) defaultText = config.defaultText;
			if ( config.defaultDuration != null ) defaultDuration = config.defaultDuration;
			if ( config.defaultAudios != null ) defaultAudios = config.defaultAudios;
			if ( config.defaultPlaybackRate != null ) {
				defaultPlaybackRate = config.defaultPlaybackRate;
				currentPlaybackRate = config.defaultPlaybackRate;
			}

			if ( config.advance != null )  {
				advance = config.advance;
				defaultAdvance = config.advance;
			}

			if ( config.autoplay != null ) autoplay = config.autoplay;
			if ( config.playerOpacity != null  ) playerOpacity = config.playerOpacity;
			if ( config.playerStyle != null ) playerStyle = config.playerStyle;
		}

		if ( 'ontouchstart' in window || navigator.msMaxTouchPoints ) {
			opacity = 1;
		}
		if ( Reveal.getConfig().audioStartAtFragment ) startAtFragment = Reveal.getConfig().audioStartAtFragment;

		// set style so that audio controls are shown on hover
		var css='.audio-controls>audio { opacity:' + playerOpacity + ';} .audio-controls:hover>audio { opacity:1;}';
		style=document.createElement( 'style' );
		if ( style.styleSheet ) {
		    style.styleSheet.cssText=css;
		}
		else {
		    style.appendChild( document.createTextNode( css ) );
		}
		document.getElementsByTagName( 'head' )[0].appendChild( style );

		silence = new SilentAudio( defaultDuration ); // create the wave file

		var divElement =  document.createElement( 'div' );
		divElement.className = "audio-controls";
		divElement.setAttribute( 'style', playerStyle );
		document.querySelector( ".reveal" ).appendChild( divElement );

		// preload all video elements that meta data becomes available as early as possible
		preloadVideoELements();

		// create audio players for all slides
		var horizontalSlides = document.querySelectorAll( '.reveal .slides>section' );
		for( var h = 0, len1 = horizontalSlides.length; h < len1; h++ ) {
			var verticalSlides = horizontalSlides[ h ].querySelectorAll( 'section' );
			if ( !verticalSlides.length ) {
				setupAllAudioElements( divElement, h, 0, horizontalSlides[ h ] );
			}
			else {
				for( var v = 0, len2 = verticalSlides.length; v < len2; v++ ) {
					setupAllAudioElements( divElement, h, v, verticalSlides[ v ] );
				}
			}
		}
	}

	function preloadVideoELements() {
		var videoElements = document.querySelectorAll( 'video[data-audio-controls]' );
		for( var i = 0; i < videoElements.length; i++ ) {
//console.warn(videoElements[i]);
			videoElements[i].load();
		}
	}

	function getText( textContainer ) {
		var elements = textContainer.querySelectorAll( '[data-audio-text]' ) ;
		for( var i = 0, len = elements.length; i < len; i++ ) {
			// replace all elements with data-audio-text by specified text
			textContainer.innerHTML = textContainer.innerHTML.replace(elements[i].outerHTML,elements[i].getAttribute('data-audio-text'));
		}
		return textContainer.textContent.trim().replace(/\s+/g, ' ');
	}

	function setupAllAudioElements( container, h, v, slide ) {
		if ( slide.querySelector( 'code.fragment:not([data-fragment-index])' ) ) {
			// somehow the timing when code fragments receive the fragment index is weird
			// this is a work around that shouldn't be necessary

			// create audio elements for slides with code fragments
			setupAudioElement( container, h + '.' + v, slide.getAttribute( 'data-audio-src' ), '', null  );
			fragments = slide.querySelectorAll( 'code.fragment' );
			for ( i = 0; i < fragments.length; i++ ) {
				setupAudioElement( container, h + '.' + v + '.' + i, null, '', null  );
			}
			return;
		}

		var textContainer =  document.createElement( 'div' );
		var text = null;
		if ( !slide.hasAttribute( 'data-audio-src' ) ) {
			// determine text for TTS
			if ( slide.hasAttribute( 'data-audio-text' ) ) {
				text = slide.getAttribute( 'data-audio-text' );
			}
			else if ( defaultNotes && Reveal.getSlideNotes( slide ) ) {
				// defaultNotes
				var div = document.createElement("div");
				div.innerHTML = Reveal.getSlideNotes( slide );
				text = div.textContent || '';
			}
			else if ( defaultText ) {
				textContainer.innerHTML = slide.innerHTML;
				// remove fragments
				var fragments = textContainer.querySelectorAll( '.fragment' ) ;
				for( var f = 0, len = fragments.length; f < len; f++ ) {
					textContainer.innerHTML = textContainer.innerHTML.replace(fragments[f].outerHTML,'');
				}
				text = getText( textContainer);
			}
// alert( h + '.' + v + ": " + text );
// console.log( h + '.' + v + ": " + text );
		}
		setupAudioElement( container, h + '.' + v, slide.getAttribute( 'data-audio-src' ), text, slide.querySelector( ':not(.fragment) > video[data-audio-controls]' ) );
		var i = 0;
		var  fragments;
		while ( (fragments = slide.querySelectorAll( '.fragment[data-fragment-index="' + i +'"]' )).length > 0 ) {
			var audio = null;
			var video = null;
			var text = '';
			for( var f = 0, len = fragments.length; f < len; f++ ) {
				if ( !audio ) audio = fragments[ f ].getAttribute( 'data-audio-src' );
				if ( !video ) video = fragments[ f ].querySelector( 'video[data-audio-controls]' );
				// determine text for TTS
				if ( fragments[ f ].hasAttribute( 'data-audio-text' ) ) {
					text += fragments[ f ].getAttribute( 'data-audio-text' ) + ' ';
				}
				else if ( defaultText ) {
					textContainer.innerHTML = fragments[ f ].textContent;
					text += getText( textContainer );
				}
			}
//console.log( h + '.' + v + '.' + i  + ": >" + text +"<")
			setupAudioElement( container, h + '.' + v + '.' + i, audio, text, video  );
 			i++;
		}
	}

	// try to sync video with audio controls
	function linkVideoToAudioControls( audioElement, videoElement ) {
		audioElement.addEventListener( 'playing', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
		} );
		audioElement.addEventListener( 'play', function( event ) {
			audioElement.playbackRate = currentPlaybackRate;
			videoElement.playbackRate = currentPlaybackRate;
			videoElement.currentTime = audioElement.currentTime;
			if ( videoElement.paused ) videoElement.play();
		} );
		audioElement.addEventListener( 'pause', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
			if ( !videoElement.paused ) videoElement.pause();
		} );
		audioElement.addEventListener( 'volumechange', function( event ) {
			videoElement.volume = audioElement.volume;
			videoElement.muted = audioElement.muted;
		} );
		audioElement.addEventListener( 'ratechange', function( event ) {
			videoElement.playbackRate = audioElement.playbackRate;
			currentPlaybackRate = audioElement.playbackRate;
		} );
		audioElement.addEventListener( 'seeked', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
		} );

		// add silent audio to video to be used as fallback
		var audioSource = audioElement.querySelector('source[data-audio-silent]');
		if ( audioSource ) audioElement.removeChild( audioSource );
		audioSource = document.createElement( 'source' );
		var videoSilence = new SilentAudio( Math.round(videoElement.duration + .5) ); // create the wave file
		audioSource.src= videoSilence.dataURI;
		audioSource.setAttribute("data-audio-silent", videoElement.duration);
		audioElement.appendChild(audioSource, audioElement.firstChild);
	}

	function setupFallbackAudio( audioElement, text, videoElement ) {
		// default file cannot be read
		if ( textToSpeechURL != null && text != null && text != "" ) {
			var audioSource = document.createElement( 'source' );
			if (textToSpeechURL.includes("[TEXT]")) {
				audioSource.src = textToSpeechURL.replace("[TEXT]", encodeURIComponent(text));
			}
			else {
				audioSource.src = textToSpeechURL + encodeURIComponent(text);
			}
			audioSource.setAttribute('data-tts',audioElement.id.split( '-' ).pop());
			audioElement.appendChild(audioSource, audioElement.firstChild);
		}
		else {
	 		if ( !audioElement.querySelector('source[data-audio-silent]') ) {
				// create silent source if not yet existent
				var audioSource = document.createElement( 'source' );
				audioSource.src = silence.dataURI;
				audioSource.setAttribute("data-audio-silent", defaultDuration);
				audioElement.appendChild(audioSource, audioElement.firstChild);
			}
		}
	}

	function setupAudioElement( container, indices, audioFile, text, videoElement ) {
		var audioElement = document.createElement( 'audio' );
		audioElement.setAttribute( 'style', "position: relative; top: 20px; left: 10%; width: 80%;" );
		audioElement.id = "audioplayer-" + indices;
		audioElement.style.display = "none";
		audioElement.setAttribute( 'controls', '' );
		audioElement.setAttribute( 'preload', 'auto' );

		audioElement.playbackRate = defaultPlaybackRate;

		if ( videoElement ) {
			// connect play, pause, volumechange, mute, timeupdate events to video
			if ( videoElement.duration ) {
				linkVideoToAudioControls( audioElement, videoElement );
			}
			else {
				videoElement.addEventListener('loadedmetadata', (event) => {
					linkVideoToAudioControls( audioElement, videoElement );
				});
			}
		}
		audioElement.addEventListener( 'ended', function( event ) {
			if ( typeof Recorder == 'undefined' || !Recorder.isRecording ) {
				// determine whether and when slideshow advances with next slide
				var advanceNow = advance;
				var slide = Reveal.getCurrentSlide();
				// check current fragment
				var indices = Reveal.getIndices();
				if ( typeof indices.f !== 'undefined' && indices.f >= 0) {
					var fragment = slide.querySelector( '.fragment[data-fragment-index="' + indices.f + '"][data-audio-advance]' ) ;
					if ( fragment ) {
						advanceNow = fragment.getAttribute( 'data-audio-advance' );
					}
				}
				else if ( slide.hasAttribute( 'data-audio-advance' ) ) {
					advanceNow = slide.getAttribute( 'data-audio-advance' );
				}
				// advance immediately or set a timer - or do nothing
				if ( advance == "true" || advanceNow == 0 ) {
					var previousAudio = currentAudio;
					Reveal.next();
					selectAudio( previousAudio );
				}
				else if ( advanceNow > 0 ) {
					timer = setTimeout( function() {
						var previousAudio = currentAudio;
						Reveal.next();
						selectAudio( previousAudio );
						timer = null;
					}, advanceNow );
				}
			}
		} );
		audioElement.addEventListener( 'play', function( event ) {
			var evt = new CustomEvent('startplayback');
			evt.timestamp = 1000 * audioElement.currentTime;
			document.dispatchEvent( evt );

			// Make sure that the currentPlaybackRate is used, which
			// might have been set by the user.
			audioElement.playbackRate = currentPlaybackRate;

			if ( timer ) { clearTimeout( timer ); timer = null; }
		} );
		audioElement.addEventListener( 'pause', function( event ) {
			if ( timer ) { clearTimeout( timer ); timer = null; }
			document.dispatchEvent( new CustomEvent('stopplayback') );
		} );
		audioElement.addEventListener( 'seeked', function( event ) {
			var evt = new CustomEvent('seekplayback');
			evt.timestamp = 1000 * audioElement.currentTime;
			document.dispatchEvent( evt );
			if ( timer ) { clearTimeout( timer ); timer = null; }
		} );
		audioElement.addEventListener( 'ratechange', function( event ) {
			currentPlaybackRate = audioElement.playbackRate;
                } );

		if ( audioFile != null ) {
			// Support comma separated lists of audio sources
			audioFile.split( ',' ).forEach( function( source ) {
				var audioSource = document.createElement( 'source' );
				audioSource.src = source;
				audioElement.insertBefore(audioSource, audioElement.firstChild);
			} );
		}
		else if ( defaultAudios ) {
			var audioExists = false;
			try {
				// check if audio file exists
				var xhr = new XMLHttpRequest();
				xhr.open('HEAD', prefix + indices + suffix, true);
	 			xhr.onload = function() {
	   				if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
						var audioSource = document.createElement( 'source' );
						audioSource.src = prefix + indices + suffix;
						audioElement.insertBefore(audioSource, audioElement.firstChild);
						audioExists = true;
					}
					else {
						setupFallbackAudio( audioElement, text, videoElement );
					}
				}
				xhr.send(null);
			} catch( error ) {
//console.log("Error checking audio" + audioExists);
				// fallback if checking of audio file fails (e.g. when running the slideshow locally)
				var audioSource = document.createElement( 'source' );
				audioSource.src = prefix + indices + suffix;
				audioElement.insertBefore(audioSource, audioElement.firstChild);
				setupFallbackAudio( audioElement, text, videoElement );
			}
		}
		if ( audioFile != null || defaultDuration > 0 ) {
			container.appendChild( audioElement );
		}
	}

	function getPlaybackRate() {
		return currentPlaybackRate;
	}

	this.toggleAutoAdvance = toggleAutoAdvance;

	return this;
};

/*****************************************************************
** Create SilentAudio
** based on: RIFFWAVE.js v0.03
** http://www.codebase.es/riffwave/riffwave.js
**
** Usage:
** silence = new SilentAudio( 10 ); // create 10 seconds wave file
**
******************************************************************/

var FastBase64={chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encLookup:[],Init:function(){for(var e=0;4096>e;e++)this.encLookup[e]=this.chars[e>>6]+this.chars[63&e]},Encode:function(e){for(var h=e.length,a="",t=0;h>2;)n=e[t]<<16|e[t+1]<<8|e[t+2],a+=this.encLookup[n>>12]+this.encLookup[4095&n],h-=3,t+=3;if(h>0){var s=(252&e[t])>>2,i=(3&e[t])<<4;if(h>1&&(i|=(240&e[++t])>>4),a+=this.chars[s],a+=this.chars[i],2==h){var r=(15&e[t++])<<2;r|=(192&e[t])>>6,a+=this.chars[r]}1==h&&(a+="="),a+="="}return a}};FastBase64.Init();var SilentAudio=function(e){function h(e){return[255&e,e>>8&255,e>>16&255,e>>24&255]}function a(e){return[255&e,e>>8&255]}function t(e){for(var h=[],a=0,t=e.length,s=0;t>s;s++)h[a++]=255&e[s],h[a++]=e[s]>>8&255;return h}this.data=[],this.wav=[],this.dataURI="",this.header={chunkId:[82,73,70,70],chunkSize:0,format:[87,65,86,69],subChunk1Id:[102,109,116,32],subChunk1Size:16,audioFormat:1,numChannels:1,sampleRate:8e3,byteRate:0,blockAlign:0,bitsPerSample:8,subChunk2Id:[100,97,116,97],subChunk2Size:0},this.Make=function(e){for(var s=0;s<e*this.header.sampleRate;s++)this.data[s]=127;this.header.blockAlign=this.header.numChannels*this.header.bitsPerSample>>3,this.header.byteRate=this.header.blockAlign*this.sampleRate,this.header.subChunk2Size=this.data.length*(this.header.bitsPerSample>>3),this.header.chunkSize=36+this.header.subChunk2Size,this.wav=this.header.chunkId.concat(h(this.header.chunkSize),this.header.format,this.header.subChunk1Id,h(this.header.subChunk1Size),a(this.header.audioFormat),a(this.header.numChannels),h(this.header.sampleRate),h(this.header.byteRate),a(this.header.blockAlign),a(this.header.bitsPerSample),this.header.subChunk2Id,h(this.header.subChunk2Size),16==this.header.bitsPerSample?t(this.data):this.data),this.dataURI="data:audio/wav;base64,"+FastBase64.Encode(this.wav)},this.Make(e)};
