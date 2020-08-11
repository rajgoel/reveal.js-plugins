# Embed tweet

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to easily embed tweets in your slides.

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/embed-tweet-demo.html)

## Installation

Copy the files ```plugin.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/embed-tweet``` and load the plugin as shown below.

```html
<script src="plugin/embed-tweet/plugin.js"></script>

<script>
    Reveal.initialize({
        // ...
        plugins: [ RevealEmbedTweet ],
        // ...
    });
</script>
```

## Usage

To embed a tweet, simply determine its URL and include the following code in your slides:

```html
<div class="tweet" data-src="TWEET_URL"></div>
```

## License

MIT licensed

Copyright (C) 2020 Asvin Goel
