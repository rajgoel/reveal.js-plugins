# Chalkboard

A plugin adding a chalkboard to reveal.js. 

[Check out the live demo](http://courses.telematique.eu/reveal.js-plugins/chalkboard-demo.html)

The plugin is based on [Chalkboard](https://github.com/mmoustafa/Chalkboard) by Mohamed Moustafa.

## Installation

Copy the file ```chalkboard.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/chalkboard```.

Add the plugins to the dependencies in your presentation as shown below. 

```javascript
Reveal.initialize({
	// ...
	chalkboard: { 
		// optionally load pre-recorded chalkboard drawing from file
		src: "chalkboard.json",
	},
	dependencies: [
		// ... 
		{ src: 'plugin/chalkboard/chalkboard.js' },
		// ... 
	],
	keyboard: {
	    67: function() { RevealChalkboard.toggleNotesCanvas() },	// toggle notes canvas when 'c' is pressed
	    66: function() { RevealChalkboard.toggleChalkboard() },	// toggle chalkboard when 'b' is pressed
	    46: function() { RevealChalkboard.clear() },	// clear chalkboard when 'DEL' is pressed
	     8: function() { RevealChalkboard.reset() },	// reset all chalkboard data when 'BACKSPACE' is pressed
	    68: function() { RevealChalkboard.download() },	// downlad recorded chalkboard drawing when 'd' is pressed
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

## Playback

If the ```autoSlide``` feature is set or if the ```audio-slideshow``` plugin is used, pre-recorded chalkboard drawings can be played. The slideshow plays back the user interaction with the chalkboard in the same way as it was conducted when recording the data.

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
