/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** An extension of the math.js plugin for reveal.js enabling
** rendering of math equations inside SVG graphics.
**
** Credits:
** - Hakim El Hattab for math.js
**   MIT licensed
** - Jason M. Sachs for svg_mathjax.js
**   Source: https://bitbucket.org/jason_s/svg_mathjax
**   License: http://www.apache.org/licenses/LICENSE-2.0
******************************************************************/

var RevealMathSVG = window.RevealMathSVG || (function(){

	var options = Reveal.getConfig().math || {};
	options.mathjax = options.mathjax || 'https://cdn.mathjax.org/mathjax/latest/MathJax.js';
	options.config = options.config || 'TeX-AMS-MML_SVG';

	loadScript( options.mathjax + '?config=' + options.config, function() {
		MathJax.Hub.Config({
			messageStyle: 'none',
			tex2jax: {
				inlineMath: [['$','$'],['\\(','\\)']] ,
				skipTags: ['script','noscript','style','textarea','pre']
			},
			skipStartupTypeset: true
		});

		// Typeset all math in SVGs
		typesetMathInSVG();

		// Typeset followed by an immediate reveal.js layout since
		// the typesetting process could affect slide height
		MathJax.Hub.Queue( [ 'Typeset', MathJax.Hub ] );
		MathJax.Hub.Queue( Reveal.layout );

		// Reprocess equations in slides when they turn visible
		Reveal.addEventListener( 'slidechanged', function( event ) {
			MathJax.Hub.Queue( [ 'Typeset', MathJax.Hub, event.currentSlide ] );
		} );

	} );

	function loadScript( url, callback ) {

		var head = document.querySelector( 'head' );
		var script = document.createElement( 'script' );
		script.type = 'text/javascript';
		script.src = url;

		// Wrapper for callback to make sure it only fires once
		var finish = function() {
			if( typeof callback === 'function' ) {
				callback.call();
				callback = null;
			}
		}

		script.onload = finish;

		// IE
		script.onreadystatechange = function() {
			if ( this.readyState === 'loaded' ) {
				finish();
			}
		}

		// Normal browsers
		head.appendChild( script );

	}

	// apply a function to elements of an array x
	function forEach( x, f ) {
		var n = x.length; for ( var i = 0; i < n; ++i ) { f( x[i] ); }
	}

	function cleanup( mathbucket ) {
		// remove the temporary items
		mathbucket.parentNode.removeChild( mathbucket );
	}

	function getFirstNumber(str) {
		var regex = /[+-]?\d+(?:\.\d+)?/g;
		var match = regex.exec(str);
		var number;
		try {
			number = match[0];
		} catch (TypeError) {
			number = null;
		}
		return number;
	}

	function getFontSize(tag) {
		var fontsize = getFirstNumber(tag.getAttribute( 'font-size' ));

		if (fontsize === null) {
			styles = tag.getAttribute('style').split(";");
			for (style_value of styles) {
				var key_value = style_value.split(":");
				if (key_value[0] === "font-size") {
					fontsize = getFirstNumber(key_value[1]);
					break;
				}
			}
		}

		return fontsize;
	}

	function replaceText( svgdest, mathjaxdiv, textcontainer ) {
		var svgmath = mathjaxdiv.getElementsByClassName( 'MathJax_SVG' )[0].getElementsByTagName( 'svg' )[0];
		var svgmathinfo = {
		  width: svgmath.viewBox.baseVal.width,
		  height: svgmath.viewBox.baseVal.height
		};
		// get graphics nodes
		var gnodes = svgmath.getElementsByTagName( 'g' )[0].cloneNode( true );
		var fontsize = getFontSize(svgdest);
		var scale = 0.0016 * fontsize;
		var x =  +svgdest.getAttribute( 'x' );
		if ( svgdest.hasAttribute( 'dx' ) ) x = x + svgdest.getAttribute( 'dx' );
		var y =  +svgdest.getAttribute( 'y' );
		if ( svgdest.hasAttribute( 'dy' ) ) x = x + svgdest.getAttribute( 'dy' );

		var transform_value = "";
		if ( svgdest.hasAttribute( 'transform' ) ) transform_value += svgdest.getAttribute( 'transform' );

		var x0 = x;
		var y0 = y;
		var x1 = -svgmathinfo.width * 0.5;
		var y1 = svgmathinfo.height * 0.25;
		transform_value += 'translate('+x0+' '+y0+') scale('+scale+') translate('+x1+' '+y1+') matrix(1 0 0 -1 0 0)'
		gnodes.setAttribute( 'transform',  transform_value);
		if ( svgdest.hasAttribute( 'fill' ) ) gnodes.setAttribute( 'fill', svgdest.getAttribute( 'fill' ) );
		if ( svgdest.hasAttribute( 'stroke' ) ) gnodes.setAttribute( 'stroke', svgdest.getAttribute( 'stroke' ) );

		textcontainer.parentNode.appendChild( gnodes );
		svgdest.parentNode.removeChild( svgdest );
	}

	function typeset( mathbucket, text, container ) {
		var regexp = /^\s*([LlRrCc]?)(\\\(.*\\\)|\$.*\$)\s*$/;
		var math = text.textContent.match(regexp);
		if ( math ) {
			var div = document.createElement( 'div' );
			mathbucket.appendChild(div);
			var mathmarkup = math[2].replace(/^\$(.*)\$$/,'\\($1\\)');
			div.appendChild( document.createTextNode( mathmarkup ) );
			MathJax.Hub.Queue( [ "Typeset",MathJax.Hub,div ] );
			MathJax.Hub.Queue( [ replaceText, text, div, container ] );
		}
	}

	function typesetMathInSVG() {
		var mathbucket = document.createElement( 'div' );
		mathbucket.setAttribute( 'id', 'mathjax_svg_bucket' );
		document.body.appendChild( mathbucket );

		forEach( document.getElementsByTagName( 'svg' ), function( svg ) {
			forEach( svg.getElementsByTagName( 'text' ), function( text ) {
				forEach( text.getElementsByTagName( 'tspan' ), function( tspan ) {
					if ( !tspan.hasAttribute( 'font-size' ) ) tspan.setAttribute( 'font-size', tspan.parentElement.getAttribute( 'font-size' ) );
					if ( !tspan.hasAttribute( 'x' ) ) tspan.setAttribute( 'x', tspan.parentElement.getAttribute( 'x' ) );
					if ( !tspan.hasAttribute( 'y' ) ) tspan.setAttribute( 'y', tspan.parentElement.getAttribute( 'y' ) );
					if ( !tspan.hasAttribute( 'fill' ) && tspan.parentElement.hasAttribute( 'fill' ) ) tspan.setAttribute( 'fill', tspan.parentElement.getAttribute( 'fill' ) );
					if ( !tspan.hasAttribute( 'stroke' ) && tspan.parentElement.hasAttribute( 'stroke' ) ) tspan.setAttribute( 'stroke', tspan.parentElement.getAttribute( 'stroke' ) );
					typeset( mathbucket, tspan, tspan.parentElement );
				});
				typeset( mathbucket, text, text );
			});
		});

		MathJax.Hub.Queue( [cleanup, mathbucket] );
	}

})();
