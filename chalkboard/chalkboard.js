/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js adding a chalkboard. 
**
** Version: 0.2
** 
** License: MIT license (see LICENSE.md)
**
** Credits: 
** Chalkboard effect by Mohamed Moustafa https://github.com/mmoustafa/Chalkboard
******************************************************************/

var RevealChalkboard = window.RevealChalkboard || (function(){
	var path = scriptPath();
	var printMode = ( /print-pdf/gi ).test( window.location.search );

	var chalkboard = document.createElement( 'div' );
	chalkboard.id = "chalkboard";
	chalkboard.style.zIndex = "25";
	chalkboard.classList.add( 'overlay' );
	chalkboard.setAttribute( 'data-prevent-swipe', '' );
	chalkboard.oncontextmenu = function() { return false; } 
	document.querySelector( '.reveal' ).appendChild( chalkboard );

	var config = Reveal.getConfig().chalkboard || {};

	var brushDiameter = 7;
	var eraserDiameter = 20;

	var width = window.innerWidth;
	var height = window.innerHeight;
	var scale = 1;
	var xOffset = 0;
	var yOffset = 0;

	var storage = { width: width, height: height, data: []};
	if ( config.src != null ) {
		loadData( config.src );
	}

	chalkboard.style.background = 'url("' + path + 'img/bg.png") repeat';
	chalkboard.style.cursor = 'url("' + path + 'img/chalk.png"), auto';
	var html = '<div class="chalk"><img id="sponge" style="visibility: hidden; position: absolute; top: 0px; left: 0px" src="' + path + 'img/sponge.png"></img></div>';
	html += '<canvas height="' + height + '" width="' + width + '" id="chalkboard"></canvas>';
	chalkboard.innerHTML = html;

	var sponge = chalkboard.querySelector("img[id=sponge]");
	var ctx = chalkboard.querySelector("canvas").getContext("2d");
	ctx.fillStyle = 'rgba(255,255,255,0.5)';	
	ctx.strokeStyle = 'rgba(255,255,255,0.5)';	
 	ctx.lineWidth = brushDiameter;
	ctx.lineCap = 'round';


	var mouseX = 0;
	var mouseY = 0;
	var xLast = null;
	var yLast = null;

	var slideStart = Date.now();
	var slideIndices =  { h:0, v:0 };
        var event = null;
        var timeouts = [];
	var touchTimeout = null;

	function scriptPath() {
		// obtain plugin path from the script element
		var path;
		if (document.currentScript) {
			path = document.currentScript.src.slice(0, -13);
		} else {
			var sel = document.querySelector('script[src$="/chalkboard.js"]')
			if (sel) {
				path = sel.src.slice(0, -13);
			}
		}
		return path;
	}

	/**
	 * Load data.
	 */
	function loadData( filename ) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.readyState === 4) {
				storage = JSON.parse(xhr.responseText);
				if ( width != storage.width || height != storage.height ) {
					scale = Math.min( width / storage.width, height / storage.height);
					xOffset = (width - storage.width * scale) / 2;
					yOffset = (height - storage.height * scale) / 2;
				}
			}
			else {
				console.warn( 'Failed to get file ' + filename +". ReadyState: " + xhr.readyState + ", Status: " + xhr.status);
			}
		};

		xhr.open( 'GET', filename, true );
		try {
			xhr.send();
		}
		catch ( error ) {
			console.warn( 'Failed to get file ' + filename + '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' + error );
		}
	}

	/**
	 * Download data.
	 */
	function downloadData() {
		if ( storage.data != []  ) {
			var a = document.createElement('a');
			document.body.appendChild(a);	
			try {
				a.download = "chalkboard.json";
				var blob = new Blob( [ JSON.stringify( storage ) ], { type: "application/json"} );
				a.href = window.URL.createObjectURL( blob );
			} catch( error ) {
				a.innerHTML += " (" + error + ")";
			}
			a.click();
			document.body.removeChild(a);
		}
	}


	function createPrintout( ) {
		var patImg = new Image(); 
		patImg.onload = function () {
			var nextSlide = [];
			var width = Reveal.getConfig().width;
			var height = Reveal.getConfig().height;
			if ( width != storage.width || height != storage.height ) {
				scale = Math.min( width / storage.width, height / storage.height);
				xOffset = (width - storage.width * scale) / 2;
				yOffset = (height - storage.height * scale) / 2;
			}

			for (var i = 0; i < storage.data.length; i++) {
				var slide = Reveal.getSlide( storage.data[i].slide.h, storage.data[i].slide.v );
				nextSlide.push( slide.nextSibling );
			}
			for (var i = 0; i < storage.data.length; i++) {
				var slideData = getSlideData( storage.data[i].slide );

				var imgCanvas = document.createElement('canvas');
				imgCanvas.width = width;
				imgCanvas.height = height;
				var imgCtx = imgCanvas.getContext("2d");
				imgCtx.fillStyle = imgCtx.createPattern( patImg ,'repeat');
				imgCtx.rect(0,0,imgCanvas.width,imgCanvas.height);
				imgCtx.fill();
				imgCtx.lineWidth = brushDiameter;

				for (var j = 0; j < slideData.events.length; j++) {
					switch ( slideData.events[j].type ) {
						case "draw":
							for (var k = 1; k < slideData.events[j].curve.length; k++) {
								draw( imgCtx, 
									xOffset + slideData.events[j].curve[k-1].x*scale, 
									yOffset + slideData.events[j].curve[k-1].y*scale, 
									xOffset + slideData.events[j].curve[k].x*scale, 
									yOffset + slideData.events[j].curve[k].y*scale
								);
							}
							break;
						case "erase":
							for (var k = 0; k < slideData.events[j].curve.length; k++) {
								erase( imgCtx, 
									xOffset + slideData.events[j].curve[k].x*scale, 
									yOffset + slideData.events[j].curve[k].y*scale
								);
							}
							break;
						case "clear":
							var newSlide = document.createElement( 'section' );
							newSlide.classList.add( 'future' );
							newSlide.innerHTML = '<h1 style="visibility:hidden">Drawing</h1>';
							newSlide.setAttribute("data-background", 'url("' + imgCanvas.toDataURL("image/png") +'")' );
							slide.parentElement.insertBefore( newSlide, nextSlide[i] );

							var imgCanvas = document.createElement('canvas');
							imgCanvas.width = width;
							imgCanvas.height = height;
							var imgCtx = imgCanvas.getContext("2d");
							imgCtx.fillStyle = imgCtx.createPattern( patImg ,'repeat');
							imgCtx.rect(0,0,imgCanvas.width,imgCanvas.height);
							imgCtx.fill();
							imgCtx.lineWidth = brushDiameter;
							break;
						default:
							break;
					}
				}
				var newSlide = document.createElement( 'section' );
				newSlide.classList.add( 'future' );
				newSlide.innerHTML = '<h1 style="visibility:hidden">Drawing</h1>';
				newSlide.setAttribute("data-background", 'url("' + imgCanvas.toDataURL("image/png") +'")' );
				slide.parentElement.insertBefore( newSlide, nextSlide[i] );

			} 
			Reveal.sync();
		};
		patImg.src = path + "img/bg.png";
	}

	/**
	 * Returns data object for the slide with the given indices.
	 */
	function getSlideData( indices ) {
		if (!indices) indices = slideIndices;
		for (var i = 0; i < storage.data.length; i++) {
			if (storage.data[i].slide.h === indices.h && storage.data[i].slide.v === indices.v && storage.data[i].slide.f === indices.f ) {
				return storage.data[i];
			}
		}
		storage.data.push( { slide: indices, events: [] } );
		return storage.data[storage.data.length-1];
	}

	function recordEvent( event ) {
		var slideData = getSlideData();
		var i = slideData.events.length;
		while ( i > 0 && event.begin < slideData.events[i-1].begin ) {
			i--;
		}
		slideData.events.splice( i, 0, event);
	}

	function startPlayback( timestamp ) {
		slideStart = Date.now() - timestamp;
//console.log("startPlayback " + timestamp );
		closeChalkboard();		
		clearChalkboard();
		
		var slideData = getSlideData( slideIndices );
		var index = 0;
		while ( index < slideData.events.length && slideData.events[index].begin < timestamp ) {
			playEvent( slideData.events[index] );
			index++;
		} 
		while ( index < slideData.events.length ) {
			timeouts.push( setTimeout( playEvent, slideData.events[index].begin - timestamp, slideData.events[index] ) );
			index++;
		} 
	};

	function stopPlayback() {
//console.log("stopPlayback");
		for (var i = 0; i < timeouts.length; i++) {
 			clearTimeout(timeouts[i]);
		}
		timeouts = [];
	};

	function playEvent( event ) {
		switch ( event.type ) {
			case "open":
				showChalkboard();
				break;
			case "close":
				closeChalkboard();
				break;
			case "clear":
				clearChalkboard();
				break;
			case "draw":
				drawCurve( event );
				break;
			case "erase":
				eraseCurve( event );
				break;

		}
	};

	function drawCurve( event ) {
		if  ( event.curve.length > 1 ) {
			var stepDuration = ( event.end - event.begin )/ ( event.curve.length - 1 );
			var timestamp = Date.now() - slideStart;
			for (var i = 1; i < event.curve.length; i++) {
				timeouts.push( setTimeout( 
					draw, Math.max(0,event.begin + i * stepDuration - timestamp), ctx, 
						xOffset + event.curve[i-1].x*scale,	
						yOffset + event.curve[i-1].y*scale, 
						xOffset + event.curve[i].x*scale, 
						yOffset + event.curve[i].y*scale 
					) 
				);
			}
		}

	};

	function eraseCurve( event ) {
		if  ( event.curve.length > 1 ) {
			var stepDuration = ( event.end - event.begin )/ event.curve.length;
			for (var i = 0; i < event.curve.length; i++) {
				timeouts.push( setTimeout( 
					erase, i * stepDuration, ctx, 
						xOffset + event.curve[i].x * scale, 
						yOffset + event.curve[i].y * scale 
					) 
				);
			}
		}

	};
	
	function draw(context,fromX,fromY,toX,toY){
		context.strokeStyle = 'rgba(255,255,255,'+(0.4+Math.random()*0.2)+')';
		context.beginPath();
  		context.moveTo(fromX, fromY);		
  		context.lineTo(toX, toY);
  		context.stroke();
  		// Chalk Effect
		var length = Math.round(Math.sqrt(Math.pow(toX-fromX,2)+Math.pow(toY-fromY,2))/(5/brushDiameter));
		var xUnit = (toX-fromX)/length;
		var yUnit = (toY-fromY)/length;
		for(var i=0; i<length; i++ ){
			var xCurrent = fromX+(i*xUnit);	
			var yCurrent = fromY+(i*yUnit);
			var xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;			
			var yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
	    		context.clearRect( xRandom, yRandom, Math.random()*2+2, Math.random()+1);
		}
	}

	function erase(context,x,y){
		context.save();
		context.beginPath();
		context.arc(x, y, eraserDiameter, 0, 2 * Math.PI, false);
		context.clip();
		context.clearRect(x - eraserDiameter - 1, y - eraserDiameter - 1, eraserDiameter * 2 + 2, eraserDiameter * 2 + 2);
		context.restore();

	}


	/**
	 * Opens an overlay for the chalkboard.
	 */
	function showChalkboard() {
		sponge.style.visibility = "hidden"; 
		chalkboard.classList.add( 'visible' );
	}


	/**
	 * Closes open chalkboard.
	 */
	function closeChalkboard() {
		if ( chalkboard ) {
			chalkboard.classList.remove( 'visible' );
			xLast = null;
			yLast = null;
			event = null;
		}
	}

	/**
	 * Clear chalkboard.
	 */
	function clearChalkboard() {
		if ( chalkboard ) {
			ctx.clearRect(0,0,width,height);
		}
	}


	document.addEventListener('touchmove', function(evt) {
		clearTimeout( touchTimeout );
		touchTimeout = null;
		if ( event ) {
		        var touch = evt.touches[0];
        		mouseX = touch.pageX;
        		mouseY = touch.pageY;
        		if (mouseY < height && mouseX < width) {
        		    evt.preventDefault();
				event.curve.push({x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale});
				if ( event.type == "erase" ) {
					sponge.style.left = (mouseX - eraserDiameter) +"px" ; 
					sponge.style.top = (mouseY - eraserDiameter) +"px" ; 
			                erase(ctx, mouseX, mouseY);
				}
				else {
			                draw(ctx, xLast, yLast, mouseX, mouseY);
				}
				xLast = mouseX;
				yLast = mouseY;
			}
		}
	}, false);

	document.addEventListener('touchstart', function(evt) {
		if ( evt.target.id == "chalkboard" ) {
				evt.preventDefault();
			        var touch = evt.touches[0];
			        mouseX = touch.pageX;
			        mouseY = touch.pageY;
				xLast = mouseX;
				yLast = mouseY;
				event = { type: "draw", begin: Date.now() - slideStart, end: null, curve: [{x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale}] };
				touchTimeout = setTimeout( showSponge, 500, mouseX, mouseY );
		}	
	}, false);

	document.addEventListener('touchend', function(evt) {
		clearTimeout( touchTimeout );
		touchTimeout = null;
		if ( event ) {
			// hide sponge image
			sponge.style.visibility = "hidden"; 
			event.end = Date.now() - slideStart;
			if ( event.type == "erase" || event.curve.length > 1 ) {
				// do not save a line with a single point only
				recordEvent( event );
			}
			event = null;
		}
	}, false);

	function showSponge(x,y) {
		if ( event ) {
			event.type = "erase";
			event.begin = Date.now() - slideStart;
			// show sponge image 
			sponge.style.left = (x - eraserDiameter) +"px" ; 
			sponge.style.top = (y - eraserDiameter) +"px" ; 
			sponge.style.visibility = "visible"; 
			erase(ctx,x,y);
		}
	}

	document.addEventListener( 'mousedown', function( evt ) {
		if ( evt.target.id == "chalkboard" ) {
			mouseX = evt.pageX;
			mouseY = evt.pageY;
			xLast = mouseX;
			yLast = mouseY;
			if ( evt.button == 2) {
				event = { type: "erase", begin: Date.now() - slideStart, end: null, curve: [{x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale}]};
				chalkboard.style.cursor = 'none';
				chalkboard.style.cursor = 'url("' + path + 'img/sponge.png") ' + eraserDiameter + ' ' + eraserDiameter + ', auto';
				erase(ctx,mouseX,mouseY);
			}
			else {
				event = { type: "draw", begin: Date.now() - slideStart, end: null, curve: [{x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale}] };
			}		
		}
	} );

	document.addEventListener( 'mousemove', function( evt ) {
		if ( event ) {
				mouseX = evt.pageX;
				mouseY = evt.pageY;
				event.curve.push({x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale});
				if(mouseY < height && mouseX < width) {
					if ( event.type == "erase" ) {
						erase(ctx,mouseX,mouseY);
					}
					else {
						draw(ctx, xLast, yLast, mouseX,mouseY);
					}
					xLast = mouseX;
					yLast = mouseY;
				}
		}
	} );

	document.addEventListener( 'mouseup', function( evt ) {
		if ( event ) {
			if(evt.button == 2){
				chalkboard.style.cursor = 'url("' + path + 'img/chalk.png") 0 0, auto';
			}
			event.end = Date.now() - slideStart;
			if ( event.type == "erase" || event.curve.length > 1 ) {
				// do not save a line with a single point only
				recordEvent( event );
			}
			event = null;
		}
	} );

	window.addEventListener( "resize", function() {
		if ( chalkboard ) {		
			// Resize the canvas and draw everything again
			ctx.canvas.width  = window.innerWidth;
			ctx.canvas.height = window.innerHeight;
			ctx.lineWidth = brushDiameter;	// reset to original value because resizing screws up the lineWidth		
			width = window.innerWidth;
			height = window.innerHeight;
			if ( width != storage.width || height != storage.height ) {
				scale = Math.min( width/storage.width, height/storage.height );
				xOffset = (width - storage.width * scale)/2;
				yOffset = (height - storage.height * scale)/2;
			}
			startPlayback();
		}

	} );


	document.addEventListener('startplayback', function( event ) {
		startPlayback( event.timestamp );				
	});

	document.addEventListener('stopplayback', function( event ) {
		stopPlayback();				
	});


	Reveal.addEventListener( 'ready', function( evt ) {
		if ( !printMode ) {
			slideStart = Date.now();
			slideIndices = Reveal.getIndices();
			if ( Reveal.isAutoSliding() ) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent( event );
			}
		}
		else {
			createPrintout();
		}
	});
	Reveal.addEventListener( 'slidechanged', function( evt ) {
		if ( !printMode ) {
			slideStart = Date.now();
			slideIndices = Reveal.getIndices();
			closeChalkboard();				
			clearChalkboard();				
			if ( Reveal.isAutoSliding() ) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent( event );
			}
		}
	});
	Reveal.addEventListener( 'fragmentshown', function( evt ) {
		if ( !printMode ) {
			slideStart = Date.now();		
			slideIndices = Reveal.getIndices();		
			closeChalkboard();				
			clearChalkboard();
			if ( Reveal.isAutoSliding() ) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent( event );
			}				
		}
	});
	Reveal.addEventListener( 'fragmenthidden', function( evt ) {
		if ( !printMode ) {
			slideStart = Date.now();		
			slideIndices = Reveal.getIndices();		
			closeChalkboard();				
			clearChalkboard();				
			if ( Reveal.isAutoSliding() ) {
				document.dispatchEvent( new CustomEvent('stopplayback') );
			}				
		}
	});
	Reveal.addEventListener( 'autoslideresumed', function( evt ) {
		var event = new CustomEvent('startplayback');
		event.timestamp = 0;
		document.dispatchEvent( event );
	});
	Reveal.addEventListener( 'autoslidepaused', function( evt ) {
		document.dispatchEvent( new CustomEvent('stopplayback') );
	});

	function toggleChalkboard() {
		if ( chalkboard.classList.contains("visible") ) {
			event = null;
			recordEvent( { type:"close", begin: Date.now() - slideStart } );
			closeChalkboard();
		}
		else {
			showChalkboard();
			recordEvent( { type:"open", begin: Date.now() - slideStart } );
		}
	};

	function clearCanvas() {
		recordEvent( { type:"clear", begin: Date.now() - slideStart } );
		clearChalkboard();
	};

	function resetStorage() {
		var ok = confirm("Please confirm to delete all chalkboard drawings?");
		if ( ok ) {
			clearChalkboard();
			if ( chalkboard.classList.contains("visible") ) {
				event = null;
				closeChalkboard();
			}
			storage = { width: width, height: height, data: []}
		}
	};

	this.toggle = toggleChalkboard;
	this.clear = clearCanvas;
	this.reset = resetStorage;
	this.download = downloadData;

	return this;
})();

