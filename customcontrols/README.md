# Custom controls

This plugin allows to add responsive custom controls to reveal.js which allow arbitrary positioning, layout, and behaviour of the controls.

[Check out the demo](https://rajgoel.github.io/reveal.js-demos/)

## Setup

To use the plugin include
```html
<!-- Font awesome is used by several plugins -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!-- Custom controls plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/customcontrols/plugin.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/customcontrols/style.css">
```
to the header of your presentation and configure reveal.js and the plugin by

```js
Reveal.initialize({
  customcontrols: {
    // add configuration here
  },
  // ...
  plugins: [ RevealCustomControls ],
  // ...
});
```

## Configuration

The plugin can be configured by adding custom controls and changing the layout of the slide number, e.g., by:


```javascript
Reveal.initialize({
	// ...
  customcontrols: {
    controls: [
      {
        id: 'toggle-overview',
        title: 'Toggle overview (O)',
        icon: '<i class="fa fa-th"></i>',
        action: 'Reveal.toggleOverview();'
      }
    ]
  },
  // ...

});
```

The `id` and `title` are optional. The configuration should be self explaining and any number of controls can be added. The style file can be altered to control the layout and responsiveness of the custom controls.

## License

MIT licensed

Copyright (C) 2023 Asvin Goel
