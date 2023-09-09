# Seminar plugin

The seminar plugin provides interaction capabilities with other hosts and participants. Multiple hosts can control the slides of the reveal.js presentation and the audience can follow the slides on their own phone, tablet or laptop as they are presented. As the hosts navigate the slides, all client presentations will update in real time. The seminar plugin supports bidirectional between hosts and participants and can be used with other plugins:

- [`chalkboard` plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/chalkboard): chalkboard drawings are updated in real time on the screen of each participant
- [`poll` plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/poll): presentations can include instant polls in which participants can select one of multiple choices and the overall results are shown, e.g., in a chart on another slide
- [`questions` plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/questions): allows to collect questions for a Q&A, participants can ask questions and upvote questions that they want to be answered first

[Check out the demo](https://rajgoel.github.io/reveal.js-demos/?topic=seminar)

## Seminar server

The `seminar` plugin requires a running socket.io server. The [`seminar`](https://github.com/rajgoel/seminar)-repository provides such a server.

> Section under construction

## Setup

To use the plugin include
```html
<!-- Seminar plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/seminar/plugin.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.js"></script>
```
to the header of your presentation and configure reveal.js and the plugin by

```js
Reveal.initialize({
	seminar: {
    // add configuration here
  },
  // ...
  plugins: [ RevealSeminar ],
  // ...
});
```



## Configuration



Example configuration:
```javascript
Reveal.initialize({
  // ...
	seminar: {
		server: 'http://localhost:4433', // change server as necessary
		room: 'Some room name', // put your room name here
		hash: '$2a$05$hhgakVn1DWBfgfSwMihABeYToIBEiQGJ.ONa.HWEiNGNI6mxFCy8S', // a hash is required for every seminar room and can be generated on the URL of the socket.io server
		autoJoin: true // set to true to auto,matically join the seminar room
	},
  // ...
	plugins: [ RevealSeminar ]
	// ...
});
```

## API

The presentation can use the following API of the seminar plugin:
- `open_or_join_room( password, username )`: Open or join a room as host. The `password` is required and is validated against the `hash`. The `username` is optional.
- `close_room( password )`: Closes the seminar room and kicks out all participants. The `password` is required and is validated against the `hash`.
- `join_room( username )`: Join an existing room as a regular participant. The `username` is optional.
- `leave_room()`: Leave the seminar room. When the last host leaves the room the room is closed and all other participants are kicked out.
kicked out.

If `autoJoin` is set to true all participants will join the room once it is opened. To open a room as a host we can add a button with id `host` and an input field with id `password` and the following code to our presentations.

```javascript
document.querySelector("#host").addEventListener('click', function(e) {
	e.preventDefault();
	RevealSeminar.open_or_join_room(document.getElementById('password').value);
});
```
## License

MIT licensed

Copyright (C) 2023 Asvin Goel
