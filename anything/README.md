# Anything

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to add anything inside an HTML object using a JSON string and a javascript function.
The plugin allows you to define a class for which the content of all HTML object of this class will be modified by a given javascript function.
Inside the HTML object you can provide a comment containing a JSON string that will be used by function to customise the content.   

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/anything-demo.html)

## Installation

Copy the file ```plugin.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/anything``` and load the plugin as shown below.

```html
<script src="plugin/anything/plugin.js"></script>

<script>
    Reveal.initialize({
        // ...
        plugins: [ RevealAnything ],
        // ...
    });
</script>
```

## Configuration & basic usage

The plugin can be configured by providing an ```anything``` option containing an array of ```className```, ```defaults```, and ```f``` within the reveal.js initialization options.


```javascript
Reveal.initialize({
	// ...
	anything: [
	 {
	  className: "random",
	  defaults: {min: 0, max: 9},
	  initialize: (function(container, options){
	    container.innerHTML = Math.trunc( options.min + Math.random()*(options.max-options.min + 1) );
	    })
	 },
	 // ...
	],
}
```

With the above configuration the plugin searches for all HTML object with class ```random```.
For each of the HTML objects it checks whether there is a JSON string within a comment inside the HTML object.
Then, it calls the function ```function(container, options)``` where ```container``` is the HTML object and ```options``` is the JSON string.
It is possible to specify the ```defaults``` parameter to be used if no JSON string is provided or not all values required by the function are given in the JSON string.

The code
```html
<p>
	Today's winning 3 digit number is :
	<span class="random"></span>,
	<span class="random"></span>,
	<span class="random"></span>.
</p>
```
produces the output

```html
<p>
	Today's winning 3 digit number is :
	<span class="random">3</span>,
	<span class="random">8</span>,
	<span class="random">0</span>.
</p>
```
The code
```html
<p>
	Today's roll of a die is:
	<span class="random"><!-- { "min": 1, "max": 6 } --></span>.
</p>
```
produces the output

```html
<p>
	Today's roll of a die is:
	<span class="random">4</span>.
</p>
```



## Advanced usage

The plugin can be used to easily integrate external javascript libraries.

### Charts.js

With the plugin charts created by [Chart.js](http://www.chartjs.org/) can easily be  included in the slides by including

```html
<script src="plugin/anything/plugin.js"></script>
<script src="Chart.min.js"></script>
```
and
```javascript
Reveal.initialize({
	// ...
	anything: [
	 {
		className: "chart",  
		initialize: (function(container, options){ container.chart = new Chart(container.getContext("2d"), options);  })
	 },
	plugins: [ RevealAnything ],
	 // ...
	],
	// ...
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

With the plugin plots of functions created by [Function-plot.js](https://github.com/maurizzzio/function-plot) can be included in the slides by including

```html
<script src="plugin/anything/plugin.js"></script>
<script src="d3/d3.v3.min.js"></script>				
<script src="d3.patch.js"></script>			
<script src="d3/queue.v1.min.js"></script>		
<script src="function-plot/dist/function-plot.js"></script>

```
and

```javascript
Reveal.initialize({
	// ...
	anything: [
	 {
		className: "plot",
		defaults: {width:500, height: 500, grid:true},
		initialize: (function(container, options){ options.target = "#"+container.id; functionPlot(options) })
	 },
	 // ...
	],
	plugins: [ RevealAnything ],
	// ...
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
## More advanced usage

The plugin allows to define functions within the JSON options.

### Example

In the following example, the function ```options.initialize(container)``` is called for each element of the class ```anything```. The function  is defined within the JSON string.

The example uses
```html
<script src="plugin/anything/plugin.js"></script>
<script src="d3/d3.v3.min.js"></script>				
<script src="d3/topojson.v1.min.js"></script>		
```
and
```javascript
Reveal.initialize({
	// ...
	anything: [
	 {
		className: "anything",
		initialize: (function(container, options){ if (options && options.initialize) { options.initialize(container)} })
	 },
	 // ...
	],
	plugins: [ RevealAnything ],
	// ...
});
```
The [d3.js](d3js.org) library can now be used to draw a [globe](http://bl.ocks.org/mbostock/ba63c55dd2dbc3ab0127) within a canvas element.

```html
<canvas width=500 height=500 class="anything">
<!--
{
  "initialize": "function(container) {
	var width = container.width,
	    height = container.height;
	var radius = height / 2 - 5,
	    scale = radius,
	    velocity = .02;
	var projection = d3.geo.orthographic()
	    .translate([width / 2, height / 2])
	    .scale(scale)
	    .clipAngle(90);
	var context = container.getContext('2d');
	var path = d3.geo.path()
	    .projection(projection)
	    .context(context);

	d3.json('reveal.js-plugins/anything/d3/world-110m.json', function(error, world) {
	  if (error) throw error;
	  var land = topojson.feature(world, world.objects.land);
	  d3.timer(function(elapsed) {
	    context.clearRect(0, 0, width, height);
	    projection.rotate([velocity * elapsed, 0]);
	    context.beginPath();
	    path(land);
	    context.fillStyle = '#fff';
	    context.fill();
	    context.beginPath();
	    context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
	    context.lineWidth = 2.5;
	    context.strokeStyle = '#fff';
	    context.stroke();
	  });
	});
	d3.select(self.frameElement).style('height', height + 'px');

    }"
}
-->
</canvas>
```

## License

MIT licensed

Copyright (C) 2020 Asvin Goel
