# Broadcast #

A plugin for Reveal.js allowing to broadcast audio and video for slide shows.

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/broadcast-demo.html)

## Installation

Copy the files of the plugin next to your reveal.js presentation and add the dependencies as below. 

```javascript
Reveal.initialize({
  // ...
  dependencies: [
    // ... 
    { src: '../reveal.js-plugins/broadcast/RTCMultiConnection.min.js'},
    { src: '../reveal.js-plugins/broadcast/socket.io.js'},
    { src: '../reveal.js-plugins/broadcast/bCrypt.js'},
    { src: '../reveal.js-plugins/broadcast/broadcast.js'},
    // ... 
  ]
});
```
## Configuration

You can configure the ```broadcast.js``` plugin by providing a ```broadcast``` option in the reveal.js initialization options. 


```javascript
Reveal.initialize({
  // ...
  broadcast: {
    // Set master password to "123456"
    secret: '$2a$05$hhgakVn1DWBfgfSwMihABeYToIBEiQGJ.ONa.HWEiNGNI6mxFCy8S', 
    // Configure RTCMultiConnection
    connection: {
      socketURL: 'https://revealjs-broadcast.herokuapp.com/'
    },
  },
  // ...
});
```
The parameter ```secret``` is a hash for the password which has to be provided when starting a broadcast. You can generate this secret with [```generatehash.html```](https://rajgoel.github.io/reveal.js-plugins/broadcast/generatehash.html). The parameter ```connection``` provides the configuration for RTCMultiConnection as described in the [API Reference](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/api.md). The only required option is the parameter ```socketURL```. For testing purposes you may use the server ```https://revealjs-broadcast.herokuapp.com/```, but availability and stability are not guaranteed. For anything mission critical I recommend you run your own server. For example, you can deploy https://github.com/muaz-khan/RTCMultiConnection on [Heroku](https://www.heroku.com/) using this [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/installation-guide.md). The only change required to ```server.js``` is to set ```isUseHTTPs = true;```

## Start broadcast

To start a broadcast you can include a button in the slideshow which calls the function ```RevealBroadcast.start``` with the  broadcast id and the master password.

```html
<input type="text" id="broadcastid" value="">
<input type="password" id="password" value="">
<a href="#" onclick="RevealBroadcast.start( { id: document.getElementById('broadcastid').value, password: document.getElementById('password').value } ); return false;">Start broadcast</a>
```
After clicking the ```Start broadcast``` button, a draggable overlay for the video is shown. Initially, the video shows a snowy image. After connecting to the server and after the user has allowed acces to camera and microphone, the video captured by the camera is shown.

## Join broadcast

To join a broadcast you can include a button in the slideshow which calls the function ```RevealBroadcast.connect``` with the  broadcast id.

```html
<input type="text" id="broadcastid" value="">
<a href="#" onclick="RevealBroadcast.connect( { id: document.getElementById('broadcastid').value } ); return false;">Join broadcast</a>
```
After clicking the ```Join broadcast``` button, a draggable overlay for the video is shown. Initially, the video shows a snowy image. After connecting to the server, the client receives audio and video of the master and the slides are updated whith every update by the master.

## Custom events

It is possible to send custom events to the clients by adding the following code to your presentation or plugin.

```javascript
var message = new CustomEvent('send');
message.content = { sender: 'someplugin', type: 'somecustomevent' };
document.dispatchEvent( message );
```
The broadcast plugin will forward this event to all connected clients who can listen to custom events using the following code.

```javascript
document.addEventListener( 'received', function ( message ) {
  // only listen to events of the same sender
  if ( message.content && message.content.sender == 'someplugin' ) {
    switch ( message.content.type ) {
      case 'somecustomevent':
        // do something
        break;
      default:
        break;
    }
  }
});
```
Whenever a new client joins the broadcast the broadcast plugins sends a ```newclient``` event. You can react to the event, e.g., by broadcasting initialisation information to all clients.

```javascript
document.addEventListener( 'newclient', function() {
  // (re-)send initialisation info as new client has joined
  var message = new CustomEvent('send');
  message.content = { 
    sender: 'someplugin', 
     type: 'init', 
     \\ ... 
  };
  document.dispatchEvent( message );
});
```
In the [demo](https://rajgoel.github.io/reveal.js-demos/broadcast-demo.html) all drawings created with the ```chalkboard.js``` plugin are broadcasted to the clients. Checkout the source code of ```chalkboard.js``` plugin for an example of the implementation.

## License

MIT licensed

Copyright (C) 2017 Asvin Goel

