var RevealAnything = window.RevealAnything || (function(){
	function parseJSON(str) {
	    str = str.replace(/(\r\n|\n|\r|\t)/gm,""); // remove lien breaks and tabs
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
	    try {
	      // Property in destination object set; update its value.
	      if ( obj2[p].constructor==Object ) {
	        obj1[p] = mergeRecursive(obj1[p], obj2[p]);
	
	      } else {
	        if ( !obj1[p] ) obj1[p] = obj2[p];
	
	      }
	
	    } catch(e) {
	      // Property in destination object not set; create it and set its value.
	      if ( !obj1[p] ) obj1[p] = obj2[p];
	
	    }
	  }
	
	  return obj1;
	}


	var config = Reveal.getConfig().anything;

	Reveal.addEventListener( 'ready', function( event ) {
		for (var i = 0; i < config.length; i++ ){
			// Get all elements of the class
			var elements = document.getElementsByClassName(config[i].className);
			var initialize = config[i].initialize;
			// deprecated parameters
			if ( !initialize && config[i].f ) {
				initialize = config[i].f;
				console.warn('Setting parameter "f" is deprecated! Use "initialize" instead. ');
			}

			for (var j = 0; j < elements.length; j++ ){
				var options = config[i].defaults;
				var comments = elements[j].innerHTML.trim().match(/<!--[\s\S]*?-->/g);
				if ( comments !== null ) for (var k = 0; k < comments.length; k++ ){
					comments[k] = comments[k].replace(/<!--/,'');
					comments[k] = comments[k].replace(/-->/,'');
					mergeRecursive( options, config[i].defaults);
					options = parseJSON(comments[k]);
					if ( options ) {
						mergeRecursive( options, config[i].defaults);
						break;
					}
				}
// console.log(config[i].className + " options: " + JSON.stringify(options))
				initialize(elements[j], options);
// console.log(elements[j].outerHTML)
			} 
		}


	} );


})();


