# Chart

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to easily add charts using [Chart.js v2.0](http://www.chartjs.org/). 

[Check out the live demo](http://courses.telematique.eu/reveal.js-plugins/chart-demo.html)

## Installation

Copy the files ```Chart.min.js``` and ```csv2chart.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/chart```.

Add the plugins to the dependencies in your presentation, as below. 

```javascript
Reveal.initialize({
	// ...
	dependencies: [
		// ... 
		{ src: 'plugin/chart/Chart.min.js' },				
		{ src: 'plugin/chart/csv2chart.js' },
		// ... 
	]
});
```
## Configuration

The plugin has several parameters that you can set for your presentation by providing an ```chart``` option in the reveal.js initialization options. 
Note that all configuration parameters are optional and the defaults of [Chart.js 2.0](http://nnnick.github.io/Chart.js/docs-v2/) will be used for parameters that are not specified.


```javascript
Reveal.initialize({
	// ...
  chart: {
	  defaults: { 
		  global: { 
			  title: { fontColor: "#FFF" }, 
		  }, 
			legend: {
				labels: { fontColor: "#FFF" },
			},
			scale: { 
				scaleLabel: { fontColor: "#FFF" }, 
				gridLines: { color: "#FFF", zeroLineColor: "#FFF" }, 
				ticks: { fontColor: "#FFF" }, 
			} 
		},
		line: { borderColor: [ "rgba(20,220,220,.8)" , "rgba(220,120,120,.8)", "rgba(20,120,220,.8)" ], "borderDash": [ [5,10], [0,0] ]}, 
		bar: { backgroundColor: [ "rgba(20,220,220,.8)" , "rgba(220,120,120,.8)", "rgba(20,120,220,.8)" ]}, 
		pie: { backgroundColor: [ ["rgba(0,0,0,.8)" , "rgba(220,20,20,.8)", "rgba(20,220,20,.8)", "rgba(220,220,20,.8)", "rgba(20,20,220,.8)"] ]},
		radar: { borderColor: [ "rgba(20,220,220,.8)" , "rgba(220,120,120,.8)", "rgba(20,120,220,.8)" ]}, 
	},
	// ...
});
```
The ```defaults``` parameter  will overwrite ```Chart.defaults```. Furthermore, for any chart type, e.g. line, bar, etc., the parameters for the individual datasets can be specified. Where Chart.js allows to specify a parameter for a particular dataset, the plugin allows to specify an array of values for this parameter, which will automatically be assigned to the datasets. Note that if there are more datasets than elements in the array, the plugin will start again with the first value in the array.

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
