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
	chalkboard: { 
		// optionally load prerecorded chalkboard drawing from file
		src: "chalkboard.json",
	},
	dependencies: [
		// ... 
		{ src: 'plugin/chalkboard/chalkboard.js' },
		// ... 
	],
	keyboard: {
	    66: function() { RevealChalkboard.toggle() },	// toggle chalkboard when 'b' is pressed
	    46: function() { RevealChalkboard.clear() },	// clear chalkboard when 'DEL' is pressed
	     8: function() { RevealChalkboard.reset() },	// reset all chalkboard data when 'BACKSPACE' is pressed
	    68: function() { RevealChalkboard.download() },	// downlad chalkboard drawing when 'd' is pressed
	},
	// ...

});
```
## Usage

### Mouse
- Click the left mouse button and drag to write on chalkboard
- Click the right mouse button and drag to wipe the chalkboard

### Touch
- Touch and move to write on chalkboard
- Touch and hold for half a second, then move to wipe the chalkboard

### Keyboard
- Click the 'DEL' key to clear the chalkboard </li>
- Click the 'd' key to download chalkboard drawings</li>
- Click the 'BACKSPACE' key to delete all chalkboard drawings</li>

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
