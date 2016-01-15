# Anything

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to add anything inside an HTML object using a JSON string and a javascript function. 
The plugin allows you to define a class for which the content of all HTML object of this class will be modified by a given javascript function. 
Inside the HTML object you can provide a commeht containing a JSON string that will be used by function to customise the content.   

[Check out the live demo](http://courses.telematique.eu/reveal.js-plugins/anything.html)

## Installation

Copy the files ```anything.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/anything```.

Add the plugins to the dependencies in your presentation, as below. 

```javascript
Reveal.initialize({
	// ...
	dependencies: [
		// ... 
		{ src: 'plugin/anything/anything.js' },
		// ... 
	]
});
```
## Configuration & usage

The plugin can be configured by providing an ```anything``` option containing an array of ```className```, ```defaults```, and ```f``` within the reveal.js initialization options. 


```javascript
Reveal.initialize({
	// ...
	anything: [ 
	 {
	  className: "indices",
	  defaults: {text:"(v,h) = "},
	  f: (function(container, options){ container.innerHTML = "<p> " + options.text + "(" + Reveal.getIndices().h + ", " + Reveal.getIndices().v +")</p>"; }) 
	 },
	 // ...
	],
```

With the above configuration the plugin searches for all HTML object with class ```indices```. 
For each of the HTML objects it checks whether there is a JSON string within a comment inside the HTML object.
Then, it calls the function ```function(container, options)``` where ```container``` is the HTML object and ```options``` is the JSON string.
It is possible to specify the ```defaults``` parameter to be used if no JSON string is provided or not all values required by the function are given in the JSON string.

The code 
```html
<div class="indices"></div>
```
produces the output

```html
<p>(v,h) = (1, 1)</p>
```
The code 
```html
<div class="indices">
<!--
{
 "text": "This slide has indices "
}
-->
</div>
```
produces the output

```html
<p>This slide has indices (1, 1)</p>
```



## Advanced usage

The plugin can be used to easily integrate external javascript libraries.

### Charts.js 

With the plugin charts created by [Chart.js v2.0](http://www.chartjs.org/) can easily be  included in the slides.

```javascript
Reveal.initialize({
	// ...
	anything: [ 
	 {
		className: "chart",  
		f: (function(container, options){ container.chart = new Chart(container.getContext("2d"), options);  })
	 },
	 // ...
	],
	dependencies: [
		// ... 
		{ src: 'Chart.min.js' },				
		{ src: 'plugin/anything/anything.js' },
		// ... 
	]
});
```
A chart can be included in a slide by adding a ```canvas``` element and a JSON string specifying the chart options. 

```html
<canvas class="chart stretch">
<!--
{
 "type": "line",
 "data": {
  "labels": ["January"," February"," March"," April"," May"," June"," July"],
  "datasets":[
   {
    "data":[" 65"," 59"," 80"," 81"," 56"," 55"," 40"],
    "label":"My first dataset","backgroundColor":"rgba(20,220,220,.8)"
   },
   {
    "data":[" 28"," 48"," 40"," 19"," 86"," 27"," 90"],
    "label":"My second dataset","backgroundColor":"rgba(220,120,120,.8)"
   }
  ]
 }, 
 "options": { "responsive": "true" }
}
-->
</canvas>
```
Note, that the [Chart  plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/chart) provides an easier way to use Chart.js.

### Function-plot.js 

With the plugin plots of functions created by [Function-plot.js](https://github.com/maurizzzio/function-plot) can easily be  included in the slides.

```javascript
Reveal.initialize({
	// ...
	anything: [ 
	 {
		className: "plot",
		defaults: {width:500, height: 500, grid:true},
		f: (function(container, options){ options.target = "#"+container.id; functionPlot(options) })
	 },
	 // ...
	],
	dependencies: [
		// ... 
		{ src: 'reveal.js-plugins/function-plot/site/js/vendor/jquery-1.11.2.min.js' },				
		{ src: 'reveal.js-plugins/function-plot/site/js/vendor/d3.js' },				
		{ src: 'reveal.js-plugins/function-plot/site/js/function-plot.js' },				
		{ src: 'plugin/anything/anything.js' },
		// ... 
	]
});
```
A plot can be included in a slide by adding a ```div``` element and a JSON string specifying the options. 

```html
<div class="plot" id="myplot1" style="background-color:#fff; width:800px; height:400px; margin: 0 auto;">
<!--
{
 "target":"#myplot1",
 "height":400,
 "width":"800",
 "xAxis":{"domain":[-10,10]},
 "yAxis":{"domain":[-5,5]},
 "grid":true,
 "data":[{"fn":"sin(x)","color":"darkred"}]
}
-->
</div>
```
With the above ```defaults```, the input can be eased, e.g.
```html
<div class="plot" id="myplot2" style="background-color:#fff; width:500px; height:500px; margin: 0 auto;">
<!--
 {
  "xAxis": {"domain": ["-10", "10"]},
  "yAxis": {"domain": ["0", "10"]},
  "data": [{ "fn": "10 -x * x/10" }]
}
-->
</div>
```



## License

MIT licensed

Copyright (C) 2016 Asvin Goel
