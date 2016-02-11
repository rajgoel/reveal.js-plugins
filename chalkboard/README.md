# Chalkboard

A plugin adding a chalkboard to reveal.js. 

[Check out the live demo](http://courses.telematique.eu/reveal.js-plugins/chart-demo.html)

The plugin is based on [Chalkboard](https://github.com/mmoustafa/Chalkboard) by Mohamed Moustafa.

## Installation

Copy the file ```chalkboard.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/chalkboard```.

Add the plugins to the dependencies in your presentation as shown below. 

```javascript
Reveal.initialize({
	// ...
	dependencies: [
		// ... 
		{ src: 'plugin/chalkboard/chalkboard.js' },
		// ... 
	]
});
```
## Usage

- Click the left mouse button to write
- Click the right mouse button to wipe
- Click the 'DEL' key to delete everything </li>

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
