# Poll plugin

> Section under construction

The poll plugin provides the capability to include instant polling within presentations using the [`seminar` plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/seminar).
A host can open a seminar room and share a link with the room name to anyone else. Everyone with the link can follow the hosted presentation and take part in the poll. To participate in a poll the client must be connected to an open seminar room, otherwise the vote will be ignored. When connected to a room, the vote will be sent to the host and the aggregated results are sent to all participants. The client presentations will be automatically update with new votes by other participants.

[Check out the demo](https://rajgoel.github.io/reveal.js-demos/?topic=seminar)

## Setup

To use the plugin include
```html
<!-- Seminar plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/seminar/plugin.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.js"></script>
<!-- Poll plugin requires seminar plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/poll/plugin.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/poll/style.css">
```
to the header of your presentation and configure reveal.js and the plugin by

```js
Reveal.initialize({
	seminar: {
    // add configuration here
  },
  // ...
  plugins: [ RevealSeminar, RevealPoll ],
  // ...
});
```


## License

MIT licensed

Copyright (C) 2023 Asvin Goel
