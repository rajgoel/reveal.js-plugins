# Animate

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to add animations using [SVG.js](https://svgjs.com).

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/animate-demo.html)

## Installation

Copy the files ```plugin.js``` and ```svg.min.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/animate``` and load the plugin as shown below.

```html
<script src="plugin/animate/plugin.js"></script>
<script src="plugin/animate/svg.min.js"></script>

<script>
    Reveal.initialize({
        // ...
        plugins: [ RevealAnimate ],
        // ...
    });
</script>
```

## Usage

An animation can be included in a slide by adding an element with the ```data-animate``` attribute. Furthermore, the filename of an SVG to be loaded can be provided by an attribute `data-src="drawing.svg"`. Alternatively, an `svg` element can be manually placed within the element. The animation is provided by a comment with a JSON-string as follows:

```html
<div data-animate data-src="drawing.svg">
<!--
{
"setup": [
...
],
"animation": [
...]
}
-->
</div>
```

The `setup` object is used to manipulate the SVG after loading. The `animation` object is used to create an SVG animation. Both objects are optional and specified by an array including individual changes to the SVG. Each item in the array has the following properties:

- `element` (optional): The selector for any element(s) within the SVG on which the `modifier` is executed with the given `parameters`. If multiple elements match the selector, the modifier is executed in a sequential fashion to all elements matched. If no `element` is provided, the `modifier` is executed on the SVG element.
- `modifier`: Any function that can be used to [manipulate SVG elements](https://svgjs.com/docs/3.0/manipulating/). Within the `setup` object, the modifier can be any user defined function manipulating the selected elements. Within the `animation` object, no user defined functions are allowed.
- `parameters`: An array of parameters for the chosen `modifier`.

For animation items the parameters  `duration`, `delay`, and `when` for the [`animate()`](https://svgjs.com/docs/3.0/animating/#animate) function may be provided. If they are not provided the defaults are taken according to the documentation of SVG.js.

If a slide has fragments, the `animation` object can be provided as an array of an array. The first item of the array is an array of animations applied to the main slide, the following items are arrays of animations applied to the fragments.

The animate plugin is designed to work with the [`audio-slideshow` plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/audio-slideshow) such that the timeline of the audio is synched with the timeline of the animation and that the animation is controlled with the audio controls. Alternatively, the animations can be controlled via the functions `play()`, `pause()`, and `seek(timstamp)`.

## Examples

The [demo](https://rajgoel.github.io/reveal.js-demos/animate-demo.html) includes various animations showcasing different ways of using the plugin. Please have a look at the the [source code](https://github.com/rajgoel/reveal.js-demos/blob/master/animate-demo.html).

### Example: Heartbeat

The following example loads a heart and creates a heartbeat animation.
```html
<div data-animate data-src="animate/heart.svg">
<!--
{
"setup": [
{
"element": "#heart",
"modifier": "function() { this.animate(1500).ease('<>').scale(.9).loop(true,true);}"
}
]
}
-->
</div>
```

### Example: Adding SVG elements

The following example loads a SVG file and adds additional SVG elements to it upon loading. When advancing through the fragments, these elements are shown.

```html
<span class="fragment"></span>
<span class="fragment"></span>
<span class="fragment"></span>
<span class="fragment"></span>

<div data-animate data-src="animate/linear_program.svg">
<!--
{
"setup": [
{
"element": "text:not([id])",
"modifier": "opacity",
"parameters": [ 0 ]
},
{
"modifier": "path",
"parameters": [ { "id": "objective", "d": "M 0,60 L 800,540",  "stroke": "firebrick", "stroke-width": 5 } ]
},
{
"modifier": "text",
"parameters": [ "3x+5y = 15", { "id": "sum_3x_5y_is_15", "opacity": "1", "x": "20", "y": "575", "font-size": "50", "font-family": "Times New Roman", "font-style": "italic", "fill": "firebrick" } ]
},
{
"modifier": "text",
"parameters": [ "3x+5y = 0", { "id": "sum_3x_5y_is_0", "opacity": "0", "x": "20", "y": "575", "font-size": "50", "font-family": "Times New Roman", "font-style": "italic", "fill": "firebrick" } ]
},
{
"modifier": "text",
"parameters": [ "3x+5y = 40", { "id": "sum_3x_5y_is_40", "opacity": "0", "x": "20", "y": "575", "font-size": "50", "font-family": "Times New Roman", "font-style": "italic", "fill": "firebrick" } ]
},
{
"modifier": "text",
"parameters": [ "3x+5y = 36", { "id": "sum_3x_5y_is_36", "opacity": "0", "x": "20", "y": "575", "font-size": "50", "font-family": "Times New Roman", "font-style": "italic", "fill": "firebrick" } ]
},
{
"modifier": "circle",
"parameters": [ { "id": "solution", "opacity": "0", "cx": 500, "cy": 150, "r": 10, "fill": "firebrick"} ]
}],
"animation": [
[],
[
{
"element": "#sum_3x_5y_is_15",
"modifier": "opacity",
"parameters": [ 0 ]
},
{
"element": "#objective",
"modifier": "attr",
"duration": 1500,
"parameters": [ { "d": "M 0,210 L 800,690" } ]
},
{
"element": "#sum_3x_5y_is_0",
"modifier": "opacity",
"parameters": [ 1 ]
}
],
[{
"element": "#sum_3x_5y_is_0",
"modifier": "opacity",
"parameters": [ 0 ]
},
{
"element": "#objective",
"modifier": "attr",
"duration": 4000,
"parameters": [ { "d": "M 0,-190 L 800,290" } ]
},
{
"element": "#sum_3x_5y_is_40",
"modifier": "opacity",
"parameters": [ 1 ]
}
],
[{
"element": "#sum_3x_5y_is_40",
"modifier": "opacity",
"parameters": [ 0 ]
},
{
"element": "#objective",
"mo
"duration": 400,
"parameters": [ { "d": "M 0,-150 L 800,330" } ]
},
{
"element": "#sum_3x_5y_is_36",
"modifier": "opacity",
"parameters": [ 1 ]
}
],
[{
"element": "#solution",
"modifier": "opacity",
"parameters": [ 1 ]
}]
]
}
-->
</div>
```

### Example: Sequential animations

The following example loads an SVG file, clones elements of the SVG, and manipulates them. Then, the cloned elements are displayed sequentially.

```html
<div data-animate data-src="animate/integer_program.svg">
<!--
{
"setup": [
{
"element": "#objective",
"modifier": "opacity",
"parameters": [ 0 ]
},
{
"element": "#feasible",
"modifier": "opacity",
"parameters": [ 0 ]
},
{
"modifier": "function() {var clone = this.findOne('#points').clone(); clone.attr({'id': 'enumeration'}); clone.addTo(this);}"
},
{
"element": "#enumeration > circle",
"modifier": "attr",
"parameters": [ { "opacity": 0, "r": 7.5, "fill": "black"} ]
}
],
"animation": [
[{
"element": "#enumeration > circle",
"modifier": "opacity",
"parameters": [ 1 ]
}]
]
}
-->
</div>
```

## License

MIT licensed

Copyright (C) 2020 Asvin Goel
