# Chalkboard

With this plugin you can add a chalkboard to reveal.js. The plugin provides two possibilities to include handwritten notes to your presentation:

- you can make notes directly on the slides, e.g. to comment on certain aspects,
- you can open a chalkboard or whiteboard on which you can make notes.

The main use case in mind when implementing the plugin is classroom usage in which you may want to explain some course content and quickly need to make some notes. 

The plugin records all drawings made so that they can be play backed using the ```autoSlide``` feature or the ```audio-slideshow``` plugin. 

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/chalkboard-demo.html)

The chalkboard effect is based on [Chalkboard](https://github.com/mmoustafa/Chalkboard) by Mohamed Moustafa.

Multi color support added by Kurt Rinnert [GitHub](https://github.com/rinnert).

## Installation

Copy the file ```chalkboard.js``` and the  ```img``` directory into the plugin folder of your reveal.js presentation, i.e. ```plugin/chalkboard```.

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
	     8: function() { RevealChalkboard.reset() },	// reset chalkboard data on current slide when 'BACKSPACE' is pressed
	    68: function() { RevealChalkboard.download() },	// downlad recorded chalkboard drawing when 'd' is pressed
	    88: function() { RevealChalkboard.colorNext() },	// cycle colors forward when 'x' is pressed
	    89: function() { RevealChalkboard.colorPrev() },	// cycle colors backward when 'y' is pressed
	},
	// ...

});
```
In order to include buttons for opening and closing the notes canvas or the chalkboard you should make sure that ```font-awesome``` is available. The easiest way is to include 
```
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
```
to the ```head``` section of you HTML-file.

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
- Press the 'DEL' key to clear the chalkboard 
- Press the 'd' key to download chalkboard drawings
- Press the 'BACKSPACE' key to delete all chalkboard drawings on the current slide
- Press the 'x' key to cycle colors forward
- Press the 'y' key to cycle colors backward

## Playback

If the ```autoSlide``` feature is set or if the ```audio-slideshow``` plugin is used, pre-recorded chalkboard drawings can be played. The slideshow plays back the user interaction with the chalkboard in the same way as it was conducted when recording the data.

## PDF-Export

If the slideshow is opened in [print mode](https://github.com/hakimel/reveal.js/#pdf-export) the pre-recorded chalkboard drawings (which must be provided in a file, see ```src``` option) are included in the PDF-file. Each drawing on the chalkboard is added after the slide that was shown when opening the chalkboard. Drawings are also included if they had been cleared (using the 'DEL' key). Drawings on the notes canvas are not included in the PDF-file.


## Configuration

The plugin has several configuration options:

- ```penWidth```: an integer. the drawing width of the pen; larger values draw thicker lines.
- ```chalkWidth```: an integer, the drawing width of the chalk; larger values draw thicker lines.
- ```chalkEffect```: a float in the range ```[0.0, 1.0]```, the intesity of the chalk effect on the chalk board. Full effect (default) ```1.0```, no effect ```0.0```.
- ```eraserDiameter```: an integer, the diameter in pixels affected by the eraser. Larger values erase a greater area. The erased area is circular.
- ```smallDefaultCursors```: Use smaller default cursors for chalks, pen and eraser.
- ```src```: Optional filename for pre-recorded drawings.
- ```readOnly```: Configuation option allowing to prevent changes to existing drawings. If set to ```true``` no changes can be made, if set to false ```false``` changes can be made, if unset or set to ```undefined``` no changes to the drawings can be made after returning to a slide or fragment for which drawings had been recorded before. In any case the recorded drawings for a slide or fragment can be cleared by pressing the 'DEL' key (i.e. by using the ```RevealChalkboard.clear()``` function).
- ```toggleNotesButton```: If set to ```true``` a button for opening and closing the notes canvas is shown. Alternatively, the css position attributes can be provided if the default position is not appropriate. 
- ```toggleChalkboardButton```: If set to ```true``` a button for opening and closing the chalkboard is shown. Alternatively, the css position attributes can be provided if the default position is not appropriate. 
- ```transition```: Gives the duration (in milliseconds) of the transition for a slide change, so that the notes canvas is drawn after the transition is completed.
- ```theme```: Can be set to either ```"chalkboard"``` or ```"whiteboard"```.

The following configuration options allow to change the appearance of the notes canvas and the chalkboard. All of these options require two values, the first gives the value for the notes canvas, the second for the chalkboard.

- ```color```: The first value gives the pen color, the second value gives the color of the board drawings. This is kept for backwards compatibility. Setting this property will overwrite the default (first) color list entries.
- ```background```: The first value expects a (semi-)transparent color which is used to provide visual feedback that the notes canvas is enabled, the second value expects a filename to a background image for the chalkboard.
- ```pen```: The first value expects a filename for an image of the pen used for the notes canvas, the second value expects a filename for an image of the pen used for the chalkboard. This is kept for backwards compatibility. Setting this property will overwrite the default (first) cursor image list entries.
- ```rememberColor```: Whether to remember the last selected color for the slide canvas or the board. 

The following options are related to multi-color support. You can provide arbitrarily long lists of colors for the slide canvas and the chalkboard/whiteboard -- all of them will be available during your presentation.  You can also provide arbitrarily long lists of corresponding cursors.  It does not make any sense to have more cursors than colors, though. Having less is fine: if you cycle to a color that has no corresponding cursor, the default cursor (first in list) will be used. By default, multi-colored cursors are provided for the chalk (corresponding to the default board colors), but not for the pen. If you configure your board colors, the default cursors might be not what you want. In this case we recommend to configure the ```chalkboard.boardCursors``` to have only one entry: the default's first (```chalk.png```). Or, of course, supply your own fancy cursors.

- ```slideColors```: A list of colors used on the slide canvas. The list can be as long as you wish.
- ```boardColors```: A list of colors used on the chalkboard or whiteboard. The list can be as long as you wish. If not configured explicitly, the ```slideColors``` will be used in whiteboard mode.
- ```slideCursors```: A list of pen cursors used on the slide canvas. The list can be as long as you wish, although there is no point in making it longer than ```slideColors```.
- ```boardCursors```: A list of pen cursors used on the chalkboard or whiteboard. The list can be as long as you wish, although there is no point in making it longer than ```boardColors```. If not configured explicitly, the ```slideCursors``` will be used in whiteboard mode.

All of the configurations are optional and the default values shown below are used if the options are not provided.

```javascript
Reveal.initialize({
	// ...
    chalkboard: {
        penWidth = 3,
        chalkWidth = 7,
        chalkEffect = 1.0,
        erasorDiameter = 20,
        smallDefaultCursors = false,
        src: null,
        readOnly: undefined, 
        toggleChalkboardButton: { left: "30px", bottom: "30px", top: "auto", right: "auto" },
        toggleNotesButton: { left: "30px", bottom: "30px", top: "auto", right: "auto" },
        transition: 800,
        theme: "chalkboard",
        // configuration options for notes canvas and chalkboard
        color: [ 'rgba(0,0,255,1)', 'rgba(255,255,255,0.5)' ],
        background: [ 'rgba(127,127,127,.1)' , 'reveal.js-plugins/chalkboard/img/blackboard.png' ],
        pen:  [ 'url(reveal.js-plugins/chalkboard/img/boardmarker.png), auto',
            'url(reveal.js-plugins/chalkboard/img/chalk.png), auto' ],
        rememberColor: [true, false],
        slideColors: ['rgba(0, 0, 255, 1)',
            'rgba(200,0,6,1)',
            'rgba(0, 157,6,1)',
            'rgba(255,52,0,1)',
            'rgba(37,86,162,1)',
            'rgba(80, 80, 80,1)'],
        boardColors: ['rgba(255,255,255,0.5)',
            'rgba(220, 133, 41, 0.5)',
            'rgba(96, 154, 244, 0.5)',
            'rgba(237, 20, 28, 0.5)',
            'rgba(20, 237, 28, 0.5)'],
        slideCursors: ['url(reveal.js-plugins/chalkboard/img/boardmarker.png), auto'],
        boardCursors: ['url(reveal.js-plugins/chalkboard/img/chalk.png), auto',
            'url(reveal.js-plugins/chalkboard/img/chalko.png), auto',
            'url(reveal.js-plugins/chalkboard/img/chalkb.png), auto',
            'url(reveal.js-plugins/chalkboard/img/chalkr.png), auto',
            'url(reveal.js-plugins/chalkboard/img//chalkg.png), auto' ]
    },
    // ...

});
```

**Note:** Customisation of pens has changed since version 0.5 of the plugin, it is now possible to use standard cursors, e.g. by setting ```pen:  [ 'crosshair', 'pointer' ]```. Please update your parameters if migrating from an older version.

**Note:** Using the ```pen``` and ```colors``` setting will overwrite the first entries in the ```slideCursors```, ```boardCursors```, ```slideColors``` and ```boardColors``` settings.  So, if you have custom configurations for multiple colors and/or cursors you might *not* want to use the ```pen``` and ```color``` configuration options. This behaviour is owed to backwards compatibility.
## License

**Note:** 

MIT licensed

Copyright (C) 2016 Asvin Goel
