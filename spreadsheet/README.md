# Spreadsheet

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to add spreadsheets using [RuleJS](https://github.com/handsontable/RuleJS). 

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/spreadsheet-demo.html)

## Installation

Copy the files ```ruleJS.all.full.min.js```, ```spreadsheet.js```, and ```spreadsheet.css``` into the plugin folder of your reveal.js presentation, i.e. ```reveal.js-plugins/spreadsheet```.

Add the plugins to the dependencies in your presentation, as below. 

```html
<head>
   <!-- ... -->
   <script src="reveal.js-plugins/spreadsheet/ruleJS.all.full.min.js"></script>
   <link rel="stylesheet" href="reveal.js-plugins/spreadsheet/spreadsheet.css">
</head>

```

```javascript

Reveal.initialize({
	// ...
	dependencies: [
		// ... 
		{ src: 'reveal.js-plugins//spreadsheet/spreadsheet.js' },
		// ... 
	]
});
```

## Configuration

The plugin has several optional parameters that you can set for your presentation by providing a```spreadsheet``` option in the reveal.js initialization options. The default values are given below.


```javascript
Reveal.initialize({
	// ...
  spreadsheet: {
	  fontsize: 24,
	  width: 150,
	  delimiter: ",",
	  precision: 4 // the maximum number of digits after the comma
  },
	// ...
});
```
## Usage

A spreadsheet can be included in a slide by adding a ```div``` element with ```class="spreadsheet"```. You can prefill the spreadsheet by providing CSV data inside the ```div``` element.

```html
<div class="spreadsheet" data-delimiter="	">
=$B$2	'Maserati'	"Mazda"	"Mercedes"	"Mini"	=A$1
2009	0	2941	4303	354	5814
2010	5	2905	2867	=SUM(A4,2,3)	=$B1
2011	4	2517	4822	552	6127
2012	=SUM(A2:A5)	=SUM(B5,E3)	=A2/B2	12	4151
</div>
```
You can add several attributes to a ```div``` element:
- ```data-rows```: Provides the number of rows (uses the number of rows of your data if unspecified) 
- ```data-cols```: Provides the number of columns (uses the number of columns of your data if unspecified) 
- ```data-csv```: Provides the filename of a CSV-file containing the data
- ```data-delimiter```: Provides the character that is used to separate cells in the input (uses the default configuration value if unspecified) 
- ```data-width```: Provides the column width (uses the default configuration value if unspecified) 
- ```data-fontsize```: Provides the font size (uses the default configuration value if unspecified) 

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
