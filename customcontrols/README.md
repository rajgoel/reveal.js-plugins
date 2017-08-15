# Custom controls

One of the core features of ```reveal.js``` is that slides are organised in two dimensions and the standard controls perfectly allow to advance the presentation horizontally and vertically.
Sometimes, however, there is a need to customize the controls, e.g., if the slideshow is intended for users who mainly want to linearly advance through it.
With this plugin you can add custom controls to reveal.js which allow arbitrary positioning, layout, and behaviour of the controls.

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/customcontrols-demo.html)


## Installation

Copy the file ```customcontrols.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/customcontrols```.

Add the plugin to the dependencies in your presentation and turn off the default controls as shown below:

```javascript
Reveal.initialize({
	controls: false,
	// ...
	dependencies: [
		// ... 
		{ src: 'plugin/customcontrols/customcontrols.js' },
		// ... 
	],
	// ...

});
```

Note, without configuration you need to add 

```javascript
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
```

between ```<head>``` and ```</head>``` of your HTML file because the defaults use [Font Awesome](http://fontawesome.io/).



## Configuration

The plugin can be configured by adding custom controls and changing the layout of the slide number, e.g., by:


```javascript
Reveal.initialize({
	// ...
	customcontrols: { 
		slideNumberCSS : 'position: fixed; display: block; right: 90px; top: auto; left: auto; width: 50px; bottom: 30px; z-index: 31; font-family: Helvetica, sans-serif; font-size:  12px; line-height: 1; padding: 5px; text-align: center; border-radius: 10px; background-color: rgba(128,128,128,.5)',
		controls: [ 
			{ icon: '<i class="fa fa-caret-left"></i>', 
			  css: 'position: fixed; right: 60px; bottom: 30px; z-index: 30; font-size: 24px;', 
			  action: 'Reveal.prev(); return false;' 
			}, 
			{ icon: '<i class="fa fa-caret-right"></i>', 
			  css: 'position: fixed; right: 30px; bottom: 30px; z-index: 30; font-size: 24px;', 
			  action: 'Reveal.next(); return false;' 
			}
		] 
	},
	// ...

});
```

The configuration should be self explaining and any number of controls can be added.

## License

MIT licensed

Copyright (C) 2017 Asvin Goel
