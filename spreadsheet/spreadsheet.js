/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** spreadsheet.js is a plugin for reveal.js allowing to integrate
** Excel-like tables supporting formulas
**
** Version: 0.1.1
** 
** License: MIT license (see LICENSE.md)
**
******************************************************************/

var RevealSpreadsheet = window.RevealSpreadsheet || (function(){
	// check if spreadsheet option is given or not
	var config = Reveal.getConfig().spreadsheet || {};

	// default values
	if (!config.precision) config.precision = 4;
	if (!config.width) config.width = 150;
	if (!config.delimiter) config.delimiter = ',';
	if (!config.fontsize) config.fontsize = '24';

	var currentSpreadsheet = null;
	var rules = new ruleJS();
	rules.init();
	rules.custom = {
           cellValue: function(row, col) {
		var cell = currentSpreadsheet.querySelector('input[data-row="' + row + '"][data-col="' + col + '"]');
		return cell.value;
           }
        };

	function createSpreadsheet(spreadsheet, CSV, comments) {
		var delimiter = spreadsheet.getAttribute("data-delimiter") || config.delimiter;
		var width = spreadsheet.getAttribute("data-width") || config.width;
		var fontsize = spreadsheet.getAttribute("data-fontsize") || config.fontsize;
		var table = document.createElement("table");
		spreadsheet.innerHTML = "";		
		spreadsheet.appendChild(table);
		var lines = CSV.split('\n').filter(function(v){return v!==''});
		// create empty spreadsheet
		var rows = spreadsheet.getAttribute("data-rows") || lines.length;
		var cols = spreadsheet.getAttribute("data-cols") || lines[0].split(delimiter).length;	
		for (var i=0; i<=rows; i++) {
		    var row = table.insertRow(-1);
		    for (var j=0; j<=cols; j++) {
		        var letter = (i+j == 0) ? "" : String.fromCharCode("A".charCodeAt(0)+j-1);
			var cell = row.insertCell(-1);
			cell.style.fontSize = fontsize + "px";
			if ( i &&j ) {
				var input = document.createElement("input");
				input.type = "text";
				input.id = letter + i;
				input.setAttribute("data-row",(i-1));
				input.setAttribute("data-col",(j-1));
				input.style.width = width + "px";
				input.style.fontSize = fontsize + "px";
    				input.onkeypress = function(e) {
        				var keyCode = e.keyCode || e.which;
        				if (keyCode == '13') {
            					var nextid = this.id.charAt(0) + String.fromCharCode(this.id.charCodeAt(1)+1);
						var spreadsheet = e.target.parentElement;
						while ( spreadsheet.className != "spreadsheet" ) spreadsheet = spreadsheet.parentElement;
            					(spreadsheet.querySelector('input[id="'+nextid+'"]') || spreadsheet.querySelector('input[id="'+this.id.charAt(0)+'1"]')).focus();
        				}	
    				};
    				input.onfocus = function(e) {
					// show function
					var formula = e.target.getAttribute("data-formula");
        				if ( formula ) {
						e.target.value = "=" + formula;
					}
    				};
    				input.onkeydown = function(e) {
					// stop propagation
					e.stopPropagation();
    				};
    				input.onkeypress = function(e) {
					// stop propagation
					e.stopPropagation();
    				};
    				input.onblur = function(e) {
       					if (e.target.value.charAt(0) == "=") {
						e.target.setAttribute("data-formula", e.target.value.substring(1));
						e.target.parentElement.classList.add('formula');
					}
					else {
						e.target.removeAttribute("data-formula");
						e.target.parentElement.classList.remove('formula');
					}
					var spreadsheet = e.target.parentElement;
					while ( spreadsheet.className != "spreadsheet" ) spreadsheet = spreadsheet.parentElement;
        				updateSpreadsheet( spreadsheet );
    				};

				cell.appendChild(input);
			}
			else {
			        cell.innerHTML = i || letter;
			}
		    }
		}


		// get data values
		for (var i = 0; i < Math.min(rows,lines.length); i++ ){
			values = lines[i].split(delimiter); 
			for (var j = 0; j < Math.min(cols, values.length); j++ ){
				var value = values[j].trim();
				value = value.replace(/^['"](.+)['"]$/,'$1');
				value = value.replace('<code>','').replace('</code>','');
				var cell = spreadsheet.querySelector('input[data-row="' + i + '"][data-col="' + j + '"]');
			        if (value.charAt(0) == "=") {
// console.log( value.substring(1) );
					cell.setAttribute("data-formula", value.substring(1));
					cell.parentElement.classList.add('formula');
					updateValue(spreadsheet, cell, value.substring(1));
				}
				else {
					cell.value = value;
				}
				updateSpreadsheet( spreadsheet );
			}
		}

	}

	function updateSpreadsheet(spreadsheet) {
		var inputs = spreadsheet.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++ ){
			var formula = inputs[i].getAttribute("data-formula");
			if ( formula ) {
				updateValue(spreadsheet, inputs[i], formula);
			}
		}
	};


    	function updateValue(spreadsheet, cell, formula) {
		currentSpreadsheet = spreadsheet;
		var parsed = rules.parse(formula, {row: cell.getAttribute("data-row"), col: cell.getAttribute("data-col"), id: cell.id});
		if ( parsed.error ) {
			cell.value =  parsed.error;
			cell.parentElement.classList.add('error');
		}
		else {
			if ( true || isNaN(parsed.result) ) {
				cell.value = parsed.result;
			}
			else {
				cell.value = +parsed.result.toFixed(config.precision);
			}
			cell.parentElement.classList.remove('error');
		}
        } 



	function initialize(){
		// Get all spreadsheets
		var spreadsheets = document.querySelectorAll("div.spreadsheet");
		for (var i = 0; i < spreadsheets.length; i++ ){
			var CSV = spreadsheets[i].innerHTML.trim();
			var comments = CSV.match(/<!--[\s\S]*?-->/g);
			CSV = CSV.replace(/<!--[\s\S]*?-->/g,'').replace(/^\s*\n/gm, "");
			if ( ! spreadsheets[i].hasAttribute("data-csv") ) {
				createSpreadsheet(spreadsheets[i], CSV, comments);
			}
			else {
				var spreadsheet = spreadsheets[i];
				var xhr = new XMLHttpRequest();
				xhr.onload = function() {
					if (xhr.readyState === 4) {
						createSpreadsheet(spreadsheet, xhr.responseText, comments);
					}
					else {
						console.warn( 'Failed to get file ' + spreadsheet.getAttribute("data-csv") +". ReadyState: " + xhr.readyState + ", Status: " + xhr.status);
					}
				};
				xhr.open( 'GET', spreadsheet.getAttribute("data-csv"), false );
				try {
					xhr.send();
				}
				catch ( error ) {
					console.warn( 'Failed to get file ' + spreadsheet.getAttribute("data-csv") + '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' + error );
				}
			}
		}
	}
	Reveal.addEventListener('ready', function(){
		initialize();
	});



})();
