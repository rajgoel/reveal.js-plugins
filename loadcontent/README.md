# Load content

This plugin allows to load content of an HTML element from a file.

## Usage

Simply add a `data-load` attribute with the filename to a `<div>` element, to load the file and add the content into to the `<div>`.

```html
<div data-load="graphics.svg">
<!-- Content of graphics.svg will be added here -->
</div>
```

## Installation

Copy the files `plugin.js` into the plugin folder of your reveal.js presentation, i.e. ```plugin/loadcontent``` and load the plugin as shown below.

```html
<script src="plugin/loadcontent/plugin.js"></script>

<script>
    Reveal.initialize({
        // ...
        plugins: [ RevealLoadContent ],
        // ...
    });
</script>
```

## License

MIT licensed

Copyright (C) 2023 Asvin Goel
