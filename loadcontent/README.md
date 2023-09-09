# Load content

This plugin allows to load content of an HTML element from a file.

[Check out the demo](https://rajgoel.github.io/reveal.js-demos/?topic=animate)

## Setup

To use the plugin include
```html
<!-- Load content plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/loadcontent/plugin.js"></script>
```
to the header of your presentation and configure reveal.js and the plugin by

```js
Reveal.initialize({
  // ...
  plugins: [ RevealLoadContent ],
  // ...
});
```

## Usage

Simply add a `data-load` attribute with the filename to a `<div>` element, to load the file and add the content into to the `<div>`.

```html
<div data-load="graphics.svg">
<!-- Content of graphics.svg will be added here -->
</div>
```

## License

MIT licensed

Copyright (C) 2023 Asvin Goel
