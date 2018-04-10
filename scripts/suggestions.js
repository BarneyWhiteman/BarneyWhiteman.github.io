var socket = io();


function loaded() {
	socket.emit('load', "I'm ready for files!");
}

//listen on the socket for instructions
socket.on('test', function(message) {
    console.log(message);
});
socket.on('suggestions', function(suggestions) {
	load_suggestions(suggestions);
});


function send_suggestion() {
	var box = document.getElementById("suggestion");
	var suggestion = box.value;
	box.value = "";
	if(suggestion == '') {
		alert("You cannot submit an empty suggestion!\nCheeky bugger :P");
		return;
	}
	console.log("suggestion: '" + suggestion + "' was sent!")
	socket.emit('suggestion', suggestion);

}

function upvote(suggestion) {
	socket.emit('upvote', suggestion);
}

function downvote(suggestion) {
	socket.emit('downvote', suggestion);
}

function load_suggestions(suggestions) {
	var topic_box = document.getElementById("topic_box");
	topic_box.innerHTML = "";
	if(suggestions.suggestions.length == 0) {

	} else {
		for(i = 0; i < suggestions.suggestions.length; i ++) {
			var html = "<p class=\"card-text\">" + suggestions.suggestions[i].suggestion + "</p><div class=\"form-inline\"><button class=\"btn btn-outline-success\" onclick=\"upvote('" + suggestions.suggestions[i].suggestion + "')\">+</button><button class=\"btn btn-outline-default\" disabled>" + suggestions.suggestions[i].votes + "</button><button class=\"btn btn-outline-danger\" onclick=\"downvote('" + suggestions.suggestions[i].suggestion + "')\">-</button></div>";
			var div = document.createElement("div");
			
			div.classList.add("card");
			div.classList.add("card-body");
			div.innerHTML = html;

			topic_box.appendChild(div);
			topic_box.innerHTML += "<br>";
		}
	}

}



