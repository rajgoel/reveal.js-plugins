/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js creating an online seminar.
**
** Version: 0.4.4
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
    close_room: function( secret ) { close_room( secret ); },
    connected: function() { return connected(); },
    hosting: function() { return hosting(); },
};

function defaultLogger( event ) {
	console.log( event  );
}

const initSeminar = function(Reveal){
	var printMode = ( /print-pdf/gi ).test( window.location.search );
	if ( printMode ) return;

	var seminar = Reveal.getConfig().seminar || {};
	if ( !seminar.server ) {
		alert("Seminar server not specified!");
		return;
	}
	seminar.url = seminar.url || window.location.host; 
	seminar.room = seminar.room || seminar.url;
	if ( !seminar.hash ) {
		alert("Hash not specified!");
		return;
	}

	const logger = seminar.logger || defaultLogger;

	var socket = io.connect( seminar.server, {
		transports: ['websocket'],
		withCredentials: true
        });
	if ( seminar.callback )
	logger('connect to ', seminar.server);
	socket.on('connect', function() {
		logger('connected to ' + seminar.server);
	});

        const STATUS = {"CHECKEDIN": 1, "JOINING": 2, "JOINED": 3, "HOSTING": 4, "CHAIRING": 5};

	var username = null;
	var status = null;

	var receivedState = null;

	function connected() {
		return ( status >= STATUS.JOINED );
	}

	function hosting() {
		return ( status >= STATUS.HOSTING );
	}

	function dispatchStatus() {
		var event = new CustomEvent('seminar');
		event.status = status;
		document.dispatchEvent( event );
	}

	var wakeLock = null; // null -> Wake Lock API not supported

	if ( 'wakeLock' in navigator ) {
		wakeLock = false; 
		console.log("Screen Wake Lock API supported");
//		logger("Screen Wake Lock API supported");
	}

	async function requestWakeLock() {
		if ( wakeLock === false ) {
			try {
				wakeLock = await navigator.wakeLock.request('screen');
				console.log('Wake Lock is active!');
//				logger('Wake Lock is active!');
				wakeLock.addEventListener('release', () => {
					// the wake lock has been released
					console.log('Wake Lock has been released');
//					logger('Wake Lock has been released');
					wakeLock = false;
				});
			} catch (err) {
  				// The Wake Lock request has failed - usually system related, such as battery.
				console.warn(`${err.name}, ${err.message}`);
				wakeLock = false; 
			}
		}
	}

	function releaseWakeLock() {
		if ( wakeLock ) {
			wakeLock.release();
		}
	}

	document.addEventListener('visibilitychange', async () => {
		if ( document.visibilityState === 'visible' && connected() ) {
			requestWakeLock();
		}
	});

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
					logger( error );
				}
				else {
					status = STATUS.CHECKEDIN;
					dispatchStatus();
					logger( `checked in as ${username}` );
				}
			});
		}
	}

	function open_or_join_room( secret ) {
		if ( status >= STATUS.HOSTING ) {
			// already hosting, ignore request to host
			logger( 'already hosting, ignoring request to host' );
			return;
		}
		if ( status == STATUS.JOINED ) {
			// leave room as participant before entering as host
			leave_room();
		}
		if ( status == STATUS.JOINING ) {
			status = STATUS.CHECKEDIN;
			dispatchStatus();
		}

 		// open or join a seminar as host
		socket.emit('host_room', { venue: seminar.url, name: seminar.room, hash: seminar.hash, secret }, function( error ){
			if (error) {
//				console.warn( error );
				logger( error );
			}
			else {
				// assume that room is opened and change status later if another host is chair 
				status = Math.max(status, STATUS.HOSTING);
				dispatchStatus();
				logger( `host room "${seminar.url}|${seminar.room}|${seminar.hash}"` );
				makeHost();
				requestWakeLock();
			}
		});
	}

	function leave_room() {
		socket.emit('leave_room', { venue: seminar.url, name: seminar.room, hash: seminar.hash }, function( error ){
			if (error) {
				logger( error );
			}
			else {
				status = STATUS.CHECKEDIN;
				dispatchStatus();
				logger( `left room "${seminar.url}|${seminar.room}|${seminar.hash}"` );
				releaseWakeLock();
			}
		});
	}

	function close_room( secret ) {
		socket.emit('close_room', { venue: seminar.url, name: seminar.room, hash: seminar.hash, secret }, function( error ){
			if (error) {
				logger( error );
			}
			else {
				status = STATUS.CHECKEDIN;
				dispatchStatus();
				logger( `room closed "${seminar.url}|${seminar.room}|${seminar.hash}"` );
				releaseWakeLock();
			}
		});
	}

	function join_room() {
		// join a seminar as regular participant
		socket.emit('join_room', { venue: seminar.url, name: seminar.room, hash: seminar.hash }, function( error ){
			logger(`try to join room "${seminar.url}|${seminar.room}|${seminar.hash}"` );
			if (error) {
				logger( error );
				status = STATUS.JOINING;
				dispatchStatus();
				releaseWakeLock();
			}
			else {
				logger( `joined room "${seminar.url}|${seminar.room}|${seminar.hash}" as ${socket.id}` );
				subscribe();
				status = STATUS.JOINED;
				dispatchStatus();
				requestWakeLock();
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
/*
	function receive( message ) {
		// receive and process a message
		if ( message.state ) {
			receivedState = message.state;
			Reveal.setState( message.state );
		}
		if ( message.content ) {
			// forward custom events to other plugins
			var event = new CustomEvent('received');
			event.content = message.content;
			document.dispatchEvent( event );
		}
	}
*/
	function sendMessage( evt ) {
		// send message w/o copy
		var data = {
			venue: seminar.url, 
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
			venue: seminar.url, 
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

	function stateChange( state ) {
		var current = Reveal.getState();
		return ( !state || !( 
                     current.indexh == state.indexh &&
                     current.indexv == state.indexv &&
                     current.indexf == state.indexf &&
                     current.paused == state.paused &&
                     current.overview == state.overview
                   ));

	}

	function broadcastStateChange( evt ) {
		if ( stateChange( receivedState ) ) {
			// broadcast state change 
			broadcastState( evt );
		}
		else {
			// ignore state change if the state is the same as the last state received 
			receivedState = null;
		}
	}

	function makeHost() {
		// Ignore notes windows
		if ( window.location.search.match( /receiver/gi ) ) return;

		subscribe();
		// Monitor events that trigger a change in state
		Reveal.on( 'slidechanged', broadcastStateChange );
		Reveal.on( 'fragmentshown', broadcastStateChange );
	
		Reveal.on( 'fragmenthidden', broadcastStateChange );
		Reveal.on( 'overviewhidden', broadcastStateChange );
		Reveal.on( 'overviewshown', broadcastStateChange );
		Reveal.on( 'paused', broadcastStateChange );
		Reveal.on( 'resumed', broadcastStateChange );
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
		logger( `room opened "${room.venue}|${room.name}|..."` );

		if ( status == STATUS.JOINING && room.venue == seminar.url && room.name == seminar.room ) {
			// try to join room as regular participant
			join_room();
		}
	});

	socket.on('kicked_out', ( room ) => {
		logger( `kicked out of room "${room.venue}|${room.name}|${room.hash}"` );
		leave_room();
		if ( status >= STATUS.JOINED ) {
			// tell other plugins that user is kicked out of the room
			var event = new CustomEvent('kicked_out');
			event.content = room;
			document.dispatchEvent( event );
			status = STATUS.JOINING;
			dispatchStatus();
			releaseWakeLock();
		}
	});

	socket.on('chair', ( room ) => {
		logger( `chairing room "${room.venue}|${room.name}|${room.hash}"` );
		status = STATUS.CHAIRING;
		dispatchStatus();
	});

	socket.on('participants', ({ room, hosts, participants }) => {
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.venue != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 

		// inform other plugins about participants
		var event = new CustomEvent('participants');
		event.content = { hosts, participants };
		document.dispatchEvent( event );
	});

	socket.on('entered_room', ({ room, user }) => {
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.venue != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 
		logger(`${user.id} entered room "${room.venue}|${room.name}|${room.hash}"` );

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
		if ( room.venue != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 

		if ( content.state && stateChange( content.state ) ) {
			// change slide if necessary
			receivedState = content.state;
			Reveal.setState(content.state);
		}
		if ( content.custom ) {
//console.log("Received announcement: ", content.custom.timestamp, content.custom.type );
			// forward custom events to other plugins
			var event = new CustomEvent('received');
			event.content = content.custom;
			document.dispatchEvent( event );
		}
	});

	socket.on('message', (  { time, room, sender, content } ) => {
//console.log(`received message: ", content );
		// make sure to only accept messages within same scope (should not be necessary)
		if ( room.venue != seminar.url || room.name != seminar.room || room.hash != seminar.hash ) return; 

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
	this.close_room = close_room;
	this.connected = connected;
	this.hosting = hosting;

	return this;
};
