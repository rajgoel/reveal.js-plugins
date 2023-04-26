/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js allowing to easily integrate any content
**
** Version: 1.1.0
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

"use strict";

window.RevealAnything = window.RevealAnything || {
	id: 'RevealAnything',
	init: function(deck) {
		if ( Reveal.getConfig().anything ) initAnything.call(this,deck);
	}
};

const initAnything = function(Reveal){
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

	/*
	* Recursively merge properties of two objects without overwriting the first
	*/
	function mergeRecursive(obj1, obj2) {

	  for (var p in obj2) {
       if ( p in obj1 ) {
	      // Property already exists in destination object;
         if ( typeof obj1[p] === 'object' && typeof obj2[p] === 'object' ) {
					// merge properties if both are objects
	        obj1[p] = mergeRecursive(obj1[p], obj2[p]);
         } 
       }
       else {
	      // Property does not yet exist in destination object; create and set its value.
	      obj1[p] = obj2[p];
       }		
//console.warn(p, obj1[p], obj2[p]);
	  }

	  return obj1;
	}


	var config = Reveal.getConfig().anything;

	Reveal.addEventListener( 'ready', function( event ) {
		for (var i = 0; i < config.length; i++ ){
			// Get all elements of the class
			var elements = document.getElementsByClassName(config[i].className);
			var initialize = config[i].initialize;

			for (var j = 0; j < elements.length; j++ ){
				var options = config[i].defaults;
				var comments = elements[j].innerHTML.trim().match(/<!--[\s\S]*?-->/g);
				if ( comments !== null ) for (var k = 0; k < comments.length; k++ ){
					comments[k] = comments[k].replace(/<!--/,'');
					comments[k] = comments[k].replace(/-->/,'');
					options = parseJSON(comments[k]);
					if ( options ) {
						options = mergeRecursive( options, config[i].defaults);
						break;
					}
				}
				initialize(elements[j], options);
			} 
		}
	} );


};


