/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js adding instant polls within an 
** online seminar.
**
** Version: 0.1.1
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

window.RevealPoll = window.RevealPoll || {
    id: 'RevealPoll',
    init: function(deck) {
        initPoll(deck);
    },
};


const initPoll = function(Reveal){
	var config = Reveal.getConfig().poll;

	var polls = [];

	// Get poll index
	function getPollIndex(id) {
		return polls.findIndex(poll => poll.id === id);
	}

	function initializePolls() {
		var pollElements = document.querySelectorAll(".poll");
//console.log(polls);
		for (var i = 0; i < pollElements.length; i++ ){
			var id = pollElements[i].getAttribute('data-poll')
			var votes = {};
			var buttons = pollElements[i].querySelectorAll("button");
			for (var j = 0; j < buttons.length; j++ ){
				// initialize number of votes for button
				votes[buttons[j].getAttribute('data-value')] = 0; 

				// make button clickable
				buttons[j].addEventListener('click', function(evt){
					if ( !RevealSeminar.connected() ) {
						alert("You are currently not connected to the live poll. Your vote is ignored.");
						return;
					}
					const button = evt.target;
					const poll = button.parentElement;
					var siblings = poll.querySelectorAll("button");
					for (var i = 0; i < siblings.length; i++ ){
						siblings[i].disabled = true;
					}
					vote( poll.getAttribute('data-poll'), button.getAttribute('data-value') );
					button.classList.add("selected"); 
					button.blur();
				});
			}
			polls.push( { id, voters: 0, votes} );
//console.log(polls);
		}

	}

	function vote( poll, choice ) {
		// send to vote to chair
		var message = new CustomEvent('send');
		message.content = { sender: 'poll-plugin', recipient: true, type: 'vote', poll, choice };
		document.dispatchEvent( message );
	}

	document.addEventListener( 'received', function ( message ) {
		if ( message.content && message.content.sender == 'poll-plugin' ) {
//console.log("Update: ", message.content);
			if ( message.content.type == 'vote' ) {
				const vote = message.content;
				const poll = polls[getPollIndex(message.content.poll)];
				// increment number of voters
				poll.voters++;
				var message = new CustomEvent('broadcast');
				message.content = { sender: 'poll-plugin', copy: true, type: 'voters', poll: poll.id, voters: poll.voters };
				document.dispatchEvent( message );

				// update results
				poll.votes[vote.choice]++;
//console.log("Vote '" + vote.choice + "' received for poll ", poll );
				message = new CustomEvent('broadcast');
				message.content = { sender: 'poll-plugin', copy: true, type: 'results', poll: poll.id, votes: poll.votes };
//console.log("Send results", message );
				document.dispatchEvent( message );
			}
			else if ( message.content.type == 'voters' ) {
//console.log("voters", message.content )
				var voters = document.querySelectorAll('.voters[data-poll="' + message.content.poll + '"]');
				for (var j = 0; j < voters.length; j++ ){
					voters[j].innerHTML = message.content.voters;
				}

			}
			else if ( message.content.type == 'results' ) {
				// update result elements
				var results = document.querySelectorAll('.results[data-poll="' + message.content.poll + '"]');
//console.log("Results", results )
				for (var i = 0; i < results.length; i++ ) {
//console.log("Votes", message.content.votes )
					for (var choice in message.content.votes) {
//console.log(choice);
						var elements = results[i].querySelectorAll('[data-value="' + choice + '"]');
						for (var j = 0; j < elements.length; j++ ) {
							elements[j].innerHTML = message.content.votes[choice];
						}
					}
				}

				// update result charts
				if ( RevealChart ) {
					var charts = document.querySelectorAll('canvas[data-chart][data-poll="' + message.content.poll + '"]');	
					var data = [];
					for (var choice in message.content.votes) {
						data.push(message.content.votes[choice]);
					}
					for (var i = 0; i < charts.length; i++ ) {
						RevealChart.update( charts[i], 0, data );
					}
				}
			}
		}
	});

	Reveal.addEventListener('ready', function(){
//alert("READY");
		initializePolls();
	});

	return this;
};
