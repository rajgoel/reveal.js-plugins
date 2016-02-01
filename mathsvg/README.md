# MathSVG

An extension of the [math.js](https://github.com/hakimel/reveal.js/#mathjax) plugin allowing to render [LaTeX](http://en.wikipedia.org/wiki/LaTeX) in SVG.

## Installation

Copy the file ```math.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/mathsvg```.

Add the plugins to the dependencies in your presentation as shown below. 

```javascript
Reveal.initialize({
	// ...
	dependencies: [
		// ... 
		{ src: 'plugin/mathsvg/math.js', async: true },
		// ... 
	]
});
```
## Usage

With the plugin you can add ```text``` elements containing LaTeX expressions as shown in the example below.

```html
<svg width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="red"/>
  <text font-size="20" x="100" y="100">$ a^2 + b^2 = c^2 $</text>
</svg>
```

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
