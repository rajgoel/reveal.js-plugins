/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js adding a chalkboard. 
**
** Credits: Mohamed Moustafa https://github.com/mmoustafa/Chalkboard
******************************************************************/

var RevealChalkboard = window.RevealChalkboard || (function(){
	var path = scriptPath();
	var isActive = false;
	var chalkboard = null;
	var ctx = null;
	var width = 0;
	var height = 0;
	var mouseX = 0;
	var mouseY = 0;
	var mouseD = false;
	var eraser = false;
	var xLast = null;
	var yLast = null;
	var brushDiameter = 7;
	var eraserWidth = 40;
	var eraserHeight = 50;

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

	function setup() {
		chalkboard = document.createElement( 'div' );
		chalkboard.id = "chalkboard";
		chalkboard.style.background = 'url("' + path + 'img/bg.png") repeat';
		var sponge = new Image(); sponge.src = path + "img/sponge.png"; // hopefully loads sponge to cache to increase responsiveness
		chalkboard.style.cursor = 'url("' + path + 'img/chalk.png"), auto';
		chalkboard.oncontextmenu = function() { return false; } 
		chalkboard.classList.add( 'overlay' );
		document.querySelector( '.reveal' ).appendChild( chalkboard );
		width = window.innerWidth;
		height = window.innerHeight;

		var html = '<div class="chalk"></div>';
		html += '<canvas height="' + height + '" width="' + width + '" id="chalkboard"></canvas>';

		chalkboard.innerHTML = html;
		ctx = chalkboard.querySelector("canvas").getContext("2d");
		ctx.fillStyle = 'rgba(255,255,255,0.5)';	
		ctx.strokeStyle = 'rgba(255,255,255,0.5)';	
    		ctx.lineWidth = brushDiameter;
		ctx.lineCap = 'round';
	} 

	function draw(x,y){
		ctx.strokeStyle = 'rgba(255,255,255,'+(0.4+Math.random()*0.2)+')';
		ctx.beginPath();
  		ctx.moveTo(xLast, yLast);		
  		ctx.lineTo(x, y);
  		ctx.stroke();
  		// Chalk Effect
		var length = Math.round(Math.sqrt(Math.pow(x-xLast,2)+Math.pow(y-yLast,2))/(5/brushDiameter));
		var xUnit = (x-xLast)/length;
		var yUnit = (y-yLast)/length;
		for(var i=0; i<length; i++ ){
			var xCurrent = xLast+(i*xUnit);	
			var yCurrent = yLast+(i*yUnit);
			var xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;			
			var yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
	    		ctx.clearRect( xRandom, yRandom, Math.random()*2+2, Math.random()+1);
		}
		xLast = x;
		yLast = y;
	}

	function erase(x,y){
		ctx.clearRect (x,y,eraserWidth,eraserHeight);
	}

	/**
	 * Opens an overlay for the chalkboard.
	 */
	function showChalkboard() {
		if ( !chalkboard ) {
			setup();
		}
		chalkboard.classList.add( 'visible' );
		isActive = true;
	}

	/**
	 * Closes open chalkboard.
	 */
	function closeChalkboard() {
		chalkboard.classList.remove( 'visible' );
		xLast = null;
		yLast = null;
		isActive = false;
	}

	document.addEventListener('touchmove', function(evt) {
	        var touch = evt.touches[0];
        	mouseX = touch.pageX;
        	mouseY = touch.pageY;
        	if (mouseY < height && mouseX < width) {
        	    evt.preventDefault();
	            if (mouseD) {
	                draw(mouseX, mouseY);
	            }
	        }
	}, false);

	document.addEventListener('touchstart', function(evt) {
	        //evt.preventDefault();
	        var touch = evt.touches[0];
	        mouseD = true;
	        mouseX = touch.pageX;
	        mouseY = touch.pageY;
	        xLast = mouseX;
	        yLast = mouseY;
	        draw(mouseX + 1, mouseY + 1);
	}, false);

	document.addEventListener('touchend', function(evt) {
	        mouseD = false;
	}, false);


	document.addEventListener( 'mousedown', function( evt ) {
		if ( isActive ) {
			mouseX = evt.pageX;
			mouseY = evt.pageY;
			xLast = mouseX;
			yLast = mouseY;
			mouseD = true;
			if ( evt.button == 2){
				chalkboard.style.cursor = 'none';
				chalkboard.style.cursor = 'url("' + path + 'img/sponge.png"), auto';
				erase(mouseX,mouseY);
				eraser = true;
			}
		}
	} );

	document.addEventListener( 'mousemove', function( evt ) {
		if ( isActive ) {
			if( mouseD ){
				mouseX = evt.pageX;
				mouseY = evt.pageY;
				if(mouseY < height && mouseX < width) {
					if ( eraser ) {
						erase(mouseX,mouseY);
					}
					else {
						draw(mouseX,mouseY);
					}
				}
			}
		}
	} );

	document.addEventListener( 'mouseup', function( evt ) {
		if ( isActive ) {
			mouseD = false;
			if(evt.button == 2){
				chalkboard.style.cursor = 'url("' + path + 'img/chalk.png"), auto';
				eraser = false;
			}
		}
	} );

	document.addEventListener('keydown', function( event ) {
		if ( isActive ) {
			if ( event.keyCode == 66) {
				// 'b'
				closeChalkboard();
			}
			if ( event.keyCode == 46 ) {
				// DEL
				ctx.clearRect(0,0,width,height);
			}
		} 
		else {
			if ( event.keyCode == 66) {
				// 'b'
				showChalkboard();
			}
		}
	}, false);


	window.addEventListener( "resize", function() {
/*
		// Below resizes the canvas but drawing suffers
		ctx.canvas.width  = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
		width = window.innerWidth;
		height = window.innerHeight;
*/
	} );

})();

