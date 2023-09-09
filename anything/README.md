# Anything

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to add anything inside an HTML object using a JSON string and a javascript function.
The plugin allows you to define a class for which the content of all HTML object of this class will be modified by a given javascript function.
Inside the HTML object you can provide a comment containing a JSON string that will be used by function to customise the content.   

[Check out the demo](https://rajgoel.github.io/reveal.js-demos/?topic=anything)

## Setup

To use the plugin include
```html
<!-- Anything plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/anything/plugin.js"></script>
```
to the header of your presentation and configure reveal.js and the plugin by

```js
Reveal.initialize({
  anything: {
    // add configuration here
  },
  // ...
  plugins: [ RevealAnything ],
  // ...
});
```

## Configuration

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


## License

MIT licensed

Copyright (C) 2023 Asvin Goel
