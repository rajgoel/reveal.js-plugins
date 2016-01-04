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

## Usage

A chart can be easily included in a slide by adding a ```canvas``` element with the ```data-chart``` attribute set to the desired chart type. Comma separated values can be given to specify the chart data. The first column provides the names for the datasets, whereas the first row provides table headers.

```html
<canvas data-chart="line">
Month, January, February, March, April, May, June, July
A, 65, 59, 80, 81, 56, 55, 40
B, 28, 48, 40, 19, 86, 27, 90
</canvas>
```
Within the canvas body, HTML comments can be used to configure the chart using JSON. If no table headers are provided, the JSON string must includes respective labels. 

```html
<canvas class="stretch" data-chart="line">
A, 65, 59, 80, 81, 56, 55, 40
<!-- This is a comment that will be ignored -->
B, 28, 48, 40, 19, 86, 27, 90
<!-- 
{ 
"data" : {
	"labels" : ["Enero", "Febrero", "Marzo", "Avril", "Mayo", "Junio", "Julio"],
	"datasets" : [{ "borderColor": "#0f0", "borderDash": ["5","10"] }, { "borderColor": "#0ff" } ]
	}
}
-->
</canvas>
```
To provide the chart from an external CSV file, the filename can be specified using the ```data-chart-src``` attribute of the ```canvas``` element. The CSV file is expected to only contain data values, whereas options for drawing the chart can be given as described above.

```html
<canvas data-chart="bar" data-chart-src="data.csv">
<!-- 
{
"data" : {
"datasets" : [{ "backgroundColor": "#0f0" }, { "backgroundColor": "#0ff" } ]
},
"options": { "responsive": true, "scales": { "xAxes": [{ "stacked": true }] } } 
}
-->
</canvas>
```



## License

MIT licensed

Copyright (C) 2016 Asvin Goel
