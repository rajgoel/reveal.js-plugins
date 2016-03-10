# Chalkboard

With this plugin you can add a chalkboard to reveal.js. The plugin provides two possibilities to include handwritten notes to your presentation:

- you can make notes directly on the slides, e.g. to comment on certain aspects,
- you can open a chalkboard on which you can make notes.

The main use case in mind when implementing the plugin is classroom usage in which you may want to explain some course content and quickly need to make some notes. 

The plugin records all drawings made so that they can be play backed using the ```autoSlide``` feature or the ```audio-slideshow``` plugin. 

[Check out the live demo](http://courses.telematique.eu/reveal.js-plugins/chalkboard-demo.html)

The chalkboard effect is based on [Chalkboard](https://github.com/mmoustafa/Chalkboard) by Mohamed Moustafa.

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
If you want to include buttons for opening and closing the notes canvas or the chalkboard you should make sure that ```font-awesome``` is available. The easiest way is to include 
```
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
```
to the ```head``` section of you HTML-fiel.

## Usage

### Enable & disable 

With above configuration the notes canvas is opened and closed when pressing 'c' and the chalkboard is opened and closed when pressing 'b'.

### Mouse
- Click the left mouse button and drag to write on notes canvas or chalkboard
- Click the right mouse button and drag to wipe away previous drawings

### Touch
- Touch and move to write on notes canvas or chalkboard
- Touch and hold for half a second, then move to wipe away previous drawings

### Keyboard
- Click the 'DEL' key to clear the chalkboard </li>
- Click the 'd' key to download chalkboard drawings</li>
- Click the 'BACKSPACE' key to delete all chalkboard drawings on the current slide</li>

## Playback

If the ```autoSlide``` feature is set or if the ```audio-slideshow``` plugin is used, pre-recorded chalkboard drawings can be played. The slideshow plays back the user interaction with the chalkboard in the same way as it was conducted when recording the data.

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
