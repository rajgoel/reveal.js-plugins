# Embed tweet

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to easily embed tweets in your slides.

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/embed-tweet-demo.html)

## Installation

Copy the files ```embed-tweet.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/embed-tweet```.

Add the plugins to the dependencies in your presentation, as below. 

```javascript
Reveal.initialize({
	// ...
	dependencies: [
		// ... 
		{ src: 'plugin/embed-tweet/embed-tweet.js' },
		// ... 
	]
});
```

## Usage

To embed a tweet, simply determine its URL and include the following code in your slides:

```html
<div class="tweet" data-src="TWEET_URL"></div>
```

## License

MIT licensed

Copyright (C) 2017 Asvin Goel
