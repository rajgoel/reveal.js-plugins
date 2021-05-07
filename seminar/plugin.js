/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js adding creating an online seminar.
**
** Version: 0.1.0
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

window.RevealSeminar = window.RevealSeminar || {
    id: 'RevealSeminar',
    init: function(deck) {

        initSeminar(deck);
    },
    open_or_join_room: function( secret, username ) { 
	checkin( username );
	open_or_join_room( secret ); 
    },
    join_room: function( username ) {
	checkin( username );
	join_room(); 
    },
    leave_room: function() { leave_room(); },
};


const initSeminar = function(Reveal){
	var seminar = Reveal.getConfig().seminar;
	if ( !seminar.server ) {
		alert("Seminar server not specified!");
		return;
	}
	seminar.url = seminar.url || window.location.host + (window.location.path || "/"); 
	seminar.room = seminar.room || seminar.url;
	if ( !seminar.hash ) {
		alert("Hash not specified!");
		return;
	}

//	var socket = io.connect( seminar.server + ':' + (seminar.port || 3000) );
	var socket = io.connect( seminar.server );
console.log('connect to ', seminar.server);
socket.on('connect', function() {
  console.log('connected', seminar.server, socket.connected);
});
        const STATUS = {"CHECKEDIN": 1, "JOINING": 2, "JOINED": 3, "HOSTING": 4, "CHAIRING": 5};

	var username = null;
	var status = null;

	function checkin( name ) {
		if ( status && name && username != name ) {
			// check out if user name changed
			socket.emit('checkout');
			status = null;
		}

		if ( !status ) {
			// use socket id as user name if not user name is not provided
			username = name || username || socket.id;

			// checkin to socket sever
			socket.emit('checkin', username, function( error ){
				if (error) {
					console.warn( error );
				}
				else {
					status = STATUS.CHECKEDIN;
					console.log( `Checked in as ${username}` );
				}
			});
		}
	}

	function open_or_join_room( secret ) {
		if ( status >= STATUS.HOSTING ) {
			// already hosting, ignore request to host
			console.warn( 'Already hosting, ignoring request to host' );
			return;
		}
		if ( status == STATUS.JOINED ) {
			// leave room as participant before entering as host
			leave_room();
		}
		if ( status == STATUS.JOINING ) {
			status = STATUS.CHECKEDIN;
		}

 		// open or join a seminar as host
		socket.emit('host_room', { url: seminar.url, name: seminar.room, hash: seminar.hash, secret }, function( error ){
			if (error) {
				console.warn( error );
			}
			else {
				// assume that room is opened and change status later if another host is chair 
				status = Math.max(status, STATUS.HOSTING);
console.log("I AM HOST ",status);
				console.log( `Host room (${seminar.url},${seminar.room},${seminar.hash})` );
				makeHost();
			}
		});
	}

	function leave_room() {
		socket.emit('leave_room', { url: seminar.url, name: seminar.room, hash: seminar.hash }, function( error ){
			if (error) {
				console.warn( error );
			}
			else {
				status = STATUS.CHECKEDIN;
				console.log( `Left room (${seminar.url},${seminar.room},${seminar.hash})` );
			}
		});
	}

	function join_room() {
		// join a seminar as regular participant
		socket.emit('join_room', { url: seminar.url, name: seminar.room, hash: seminar.hash }, function( error ){
console.log("Try to join room:", seminar.url, seminar.room, seminar.hash );
			if (error) {
				console.warn( error );
				status = STATUS.JOINING;
			}
			else {
console.log( `Joined room (${seminar.url},${seminar.room},${seminar.hash}) as ${socket.id}` );
				subscribe();
				status = STATUS.JOINED;
			}
		});
	}
/*
	function announce( evt, cc ) {
		// make an announcement to everyone (else)
	}

	function send( evt, recipient, cc ) {
		// send a message to recipient
	}
*/	
	function receive( message ) {
		// receive and process a message
		if ( message.state ) {
			Reveal.setState( message.state );
		}
		if ( message.content ) {
			// forward custom events to other plugins
			var event = new CustomEvent('received');
			event.content = message.content;
			document.dispatchEvent( event );
		}
	}

	function sendMessage( evt ) {
		// send message w/o copy
		var data = {
			url: seminar.url, 
			name: seminar.room,
			hash: seminar.hash, 
			recipient: (evt.content || {}).recipient,
			copy: (evt.content || {}).copy, 
			content: evt.content
		};
		if ( data.content ) {
			delete data.content.recipient;
			delete data.content.copy;
		}
		socket.emit( 'message', data );
	};



	function subscribe() {
		document.addEventListener( 'send', function( evt ) { 
			if ( !evt ) return;
			// send custom events which are sent by other plugins
			sendMessage(evt); 
		});
	}

	function broadcastState( evt ) {
		var data = {
			url: seminar.url, 
			name: seminar.room,
			hash: seminar.hash, 
			recipient: null,
			copy: (evt.content || {}).copy, 
			content: { state: Reveal.getState(), custom: (evt || {}).content }
		};
		if ( data.content ) {
			delete data.content.recipient;
			delete data.content.copy;
		}
		socket.emit( 'announcement', data );
	};

	function makeHost() {
		// Ignore notes windows
		if ( window.location.search.match( /receiver/gi ) ) return;

		subscribe();
		// Monitor events that trigger a change in state
		Reveal.on( 'slidechanged', broadcastState );
		Reveal.on( 'fragmentshown', broadcastState );
	
		Reveal.on( 'fragmenthidden', broadcastState );
		Reveal.on( 'overviewhidden', broadcastState );
		Reveal.on( 'overviewshown', broadcastState );
		Reveal.on( 'paused', broadcastState );
		Reveal.on( 'resumed', broadcastState );
		document.addEventListener( 'broadcast', function( evt ) { 
			// broadcast custom events w/o recipient which are sent by other plugins
			if ( evt && !evt.recipient ) {
				broadcastState(evt); 
			}
		});
	}

/*
	socket.on('rooms', ( rooms ) => {
console.log(rooms);
	});
*/
	socket.on('room_opened', ( room ) => {
console.log('room_opened', room, status == STATUS.JOINING, room.url, seminar.url, room.name, seminar.room );

		if ( status == STATUS.JOINING && room.url == seminar.url && room.name == seminar.room ) {
			// try to join room as regular participant
			join_room();
		}
	});

	socket.on('kicked_out', ( room ) => {
console.log("kicked_out",room);
		leave_room();
		if ( status >= STATUS.JOINED ) {
			// tell other plugins that user is kicked out of the room
			var event = new CustomEvent('kicked_out');
			event.content = room;
			document.dispatchEvent( event );
			status = STATUS.JOINING;
		}
	});

	socket.on('chair', ( room ) => {
		status = STATUS.CHAIRING;
console.log("I AM CHAIR",status);
	});

	socket.on('participants', ({ room, hosts, participants }) => {
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.url != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 

		// inform other plugins about participants
		var event = new CustomEvent('participants');
		event.content = { hosts, participants };
		document.dispatchEvent( event );
	});

	socket.on('entered_room', ({ room, user }) => {
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.url != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 
console.log(`${user.id} entered room`, room );

		if ( status == STATUS.CHAIRING ) {
			// send current state to the new participant
			// tell other plugins that they can send a welcome message to the new participant
			var event = new CustomEvent('welcome');
			event.content = { user };
			document.dispatchEvent( event );
		}
	});

	socket.on('announcement', (  { time, room, sender, content } ) => {
//console.log("Received message: ", content );
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.url != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 

		if ( content.state && content.state != Reveal.getState() ) {
			// change slide if necessary
			Reveal.setState(content.state);
		}
		if ( content.custom ) {
console.log("Received announcement: ", content.custom.timestamp, content.custom.type );
			// forward custom events to other plugins
			var event = new CustomEvent('received');
			event.content = content.custom;
			document.dispatchEvent( event );
		}
	});

	socket.on('message', (  { time, room, sender, content } ) => {
console.log("Received message: ", content );
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.url != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 

		if ( content ) {
			// forward custom events to other plugins
			var event = new CustomEvent('received');
			event.content = content;
			document.dispatchEvent( event );
		}
	});
	
	// automatically join room as participant if data is provided
	if ( seminar.autoJoin && seminar.url && seminar.room && seminar.hash ) {
		checkin();

                if ( seminar.secret ) {
			// if secret is provided open or join room as host
			open_or_join_room( seminar.secret );
		}
		else {
			// join existing room as regular participant
			join_room();
		}
	}

	this.checkin = checkin;
	this.open_or_join_room = open_or_join_room;
	this.join_room = join_room;
	this.leave_room = leave_room;

	return this;
};
