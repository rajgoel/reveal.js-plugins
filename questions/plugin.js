/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js adding a Q&A to an online seminar.
**
** Version: 0.1.4
**
** License: MIT license (see LICENSE.md)
**
******************************************************************/

window.RevealQnA = window.RevealQnA || {
    id: 'RevealQnA',
    init: function(deck) {
        initQnA(deck);
    },
    toggleQnA: function() { toggleQnA(); },
};


const initQnA = function(Reveal){
	var config = Reveal.getConfig().questions || {};
        const STATUS = {"JOINED": 3, "HOSTING": 4};
	var connected = false;
	enableOrDisable(connected);
	var questions = 0;
	var counter = 0;

	// create Q&A div
	var container = document.createElement("div");
	container.classList.add("qna");
	container.classList.add("dashboard");
	container.classList.add("overlay");
	container.style.visibility = "hidden";
	container.setAttribute( 'data-prevent-swipe', '' );

	container.oncontextmenu = function() { return false; }
	container.style.zIndex = 26;

	container.innerHTML = "<h1> Q&A </h1>";

	// question template
	var questionTemplate = document.createElement('div');
	questionTemplate.classList.add("qna");
	questionTemplate.classList.add("question");
	questionTemplate.innerHTML = 	'<div class="user">Anonymous</div>' +
				'<div class="text">Text</div>' +
				'<div class="votes"><span>-1</span> <i class="fa fa-thumbs-up"></i></div>' +
				'<div class="close"><i class="fa fa-check"></i></div>';

	container.innerHTML = '<div class="qna ask"><input type="text" placeholder="Enter question" required="" autocomplete="off"></input><button>Ask <i class="fa fa-paper-plane"></button></div>';

	container.querySelector("input").addEventListener('keypress', function( e ) {
		e.stopPropagation(); // consume all key presses and do not allow other to listen to them
		if (e.which === 13) {
			// ask question when hitting enter
			this.nextSibling.click();
		}
	});

	container.querySelector("button").addEventListener('click', function() {
		var inputElement = this.parentElement.firstChild;
		if ( inputElement.value ) {
			ask( inputElement.value );
//			createQuestion( { id: 0, text: inputElement.value, user: "Anonymous", votes: 0, open: true } );
			inputElement.value = "";
		}
	});

	var questionList = document.createElement("div");
	questionList.classList.add("qna");
	questionList.classList.add("questions");
	container.appendChild(questionList);
	document.querySelector( '.reveal' ).appendChild( container );

	function toggleQnA( show ) {
		let dashboard = document.querySelector('.qna.dashboard');
		if ( !dashboard ) return;
		if ( show == undefined ) {
			show = ( dashboard.style.visibility == "hidden" );
		}
		dashboard.style.visibility = show ? "visible" : "hidden";
	}


	function getQuestion( id ) {
		// returns undefined if question is not found
		return document.querySelector(`.qna.question[data-id="${id}"]`);
	}

	function ask( text ) {
		// ask a question
		var message = new CustomEvent('send');
		message.content = { sender: 'questions-plugin', recipient: true, type: 'ask', text, username: 'Anonymous' };
		document.dispatchEvent( message );
	}

	function upvote( questionElement ) {
//		questionElement.question.votes++;
		var message = new CustomEvent('send');
		message.content = { sender: 'questions-plugin', recipient: true, type: 'upvote', id: questionElement.question.id  };
		document.dispatchEvent( message );
	}

	function close( questionElement ) {
		// close a question (only host)
		var question = Object.assign({}, questionElement.question );
		question.open = false;

		var message = new CustomEvent('broadcast');
		message.content = { sender: 'questions-plugin', copy: true, question };
		document.dispatchEvent( message );
	}


	function bubbleUp ( questionElement ) {
		// bubble question upwards if necessary
		while ( questionElement.previousSibling ) {
			if ( questionElement.question.votes > questionElement.previousSibling.question.votes || questionElement.question.open > questionElement.previousSibling.question.open ) {
				questionElement = questionElement.parentElement.insertBefore( questionElement, questionElement.previousSibling );
			}
			else {
				break;
			}
		}
		return questionElement;
	};

	function bubbleDown ( questionElement ) {
		// bubble question downwards if necessary
		while ( questionElement.nextSibling ) {
			if ( questionElement.nextSibling.question.open > questionElement.question.open || questionElement.nextSibling.question.votes > questionElement.question.votes  ) {
				questionElement = questionElement.parentElement.insertBefore( questionElement, questionElement.nextSibling.nextSibling );
			}
			else {
				break;
			}
		}
		return questionElement;
	};


	function createQuestion( question ) {
		// add new question and show it
		var div = questionTemplate.cloneNode(true);
		div.dataset.id = question.id;

		div.querySelector(".user").innerHTML = question.username;
		div.querySelector(".votes > span").innerHTML = question.votes;
		div.querySelector(".text").innerHTML = question.text;

		div.querySelector(".votes").addEventListener( 'click', function( e ) {
			if ( !this.classList.contains("disabled") && !this.parentElement.classList.contains("closed") ) {
				this.classList.add("disabled");
				upvote( this.parentElement );
			}
		});

		if ( RevealSeminar.hosting() && question.open ) {
			div.querySelector(".close").addEventListener( 'click', function( e ) {
				if ( !this.parentElement.classList.contains("closed") ) {
					close( this.parentElement );
				}
			});
		}
		else {
			div.querySelector(".close").style.visibility = "hidden";
		}

		div.question = question;

		// increment open question counter
		if ( question.open ) {
			counter++;
			var elements = document.querySelectorAll('.qna.question-counter');
			for ( var i=0; i < elements.length; i++ ) {
				elements[i].innerHTML = counter;
			}
		}
		else {
			div.classList.add("closed");	
		}

		return bubbleUp( document.querySelector('.qna > .questions').appendChild(div) );
	}

	function enableOrDisable(connected) {
		var buttons = document.querySelectorAll('#toggle-questions');
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].style.display = connected ? "inherit" : "none";
		}
		if ( !connected ) {
			toggleQnA( false ); // close Q&A
			Reveal.removeKeyBinding( 81 );
		}
		else {
			Reveal.addKeyBinding( { keyCode: 81, key: 'Q', description: 'Toggle Q&A' }, () => {
				toggleQnA();
			} )
		}
	}

	document.addEventListener( 'seminar', function ( message ) {
		// update status
//console.log(message.status);
		enableOrDisable(message.status >= STATUS.JOINED);
	});

	document.addEventListener( 'received', function ( message ) {
		if ( message.content && message.content.sender == 'questions-plugin' ) {
//console.log("Received", message.content);
			switch (message.content.type) {
				case 'ask':
//if ( !RevealSeminar.hosting() ) alert("I should be host!");
					questions++;
//console.log("Broadcast", message.content.text);
					var event = new CustomEvent('broadcast');
					event.content = { sender: 'questions-plugin', copy: true, question: { id: questions, username: message.content.username, text: message.content.text, votes: 0, open: true} };
					document.dispatchEvent( event );
				break;
				case 'upvote':
//if ( !RevealSeminar.hosting() ) alert("I should be host!");
					var questionElement = getQuestion(message.content.id);
//console.log(message.content.id, questionElement);
					var question = Object.assign({}, questionElement.question);
					question.votes++;
					var event = new CustomEvent('broadcast');
					event.content = { sender: 'questions-plugin', copy: true, question };
					document.dispatchEvent( event );
//					questionElement.question.votes--; // undo increment and do it later again
				break;
				default:
					var questionElement = getQuestion(message.content.question.id);
					if ( !questionElement ) {
						createQuestion( message.content.question );
						break;
					}
				
//console.log("Update", questionElement.question, message.content.question);
					// update existing question
					if ( questionElement.question.open && !message.content.question.open ) {
//console.log("Close");
						// decrement open question counter
						counter--;
						var elements = document.querySelectorAll('.qna.question-counter');
						for ( var i=0; i < elements.length; i++ ) {
							elements[i].innerHTML = (counter == 0) ? '' : counter;
						}
	
						// close question
						questionElement.classList.add("closed");	

						// update data
						questionElement.question = message.content.question;
						bubbleDown( questionElement );
					}
					else if ( questionElement.question.votes < message.content.question.votes ) {
//console.log("Upvoted", questionElement.question.votes , message.content.question.votes);
						// update votes
						var element = questionElement.querySelector('.votes > span');
						if ( element ) {
							element.innerHTML = message.content.question.votes;
						}

						// update data
						questionElement.question = message.content.question;
						bubbleUp( questionElement );
					}

			}
		}
	});


	this.toggleQnA = toggleQnA;

	return this;
};
