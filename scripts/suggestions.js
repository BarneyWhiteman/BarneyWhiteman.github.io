var socket = io.connect();

var flag_names = [];
var flag_values = [];

var suggestions;

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
	socket.emit('suggestion', suggestion);

}

function upvote(index) {
	var i = flag_names.indexOf(suggestions.suggestions[index].suggestion);
	if(i != -1 && flag_values[i] != 1) {
		socket.emit('upvote', index);
		flag_values[i] += 1;
	}
}

function downvote(index) {
	var i = flag_names.indexOf(suggestions.suggestions[index].suggestion);
	if(i != -1 && flag_values[i] != -1) {
		socket.emit('downvote', index);
		flag_values[i] -= 1;
	}
}

function load_suggestions(s) {
	suggestions = s;
	set_flags(suggestions);
	var topic_box = document.getElementById("topic_box");
	topic_box.innerHTML = "";
	if(suggestions.suggestions.length == 0) {

	} else {
		for(i = 0; i < suggestions.suggestions.length; i ++) {
			var html = "<p class=\"card-text\">" + suggestions.suggestions[i].suggestion + "</p><div class=\"form-inline\"><button class=\"btn btn-outline-success\" onclick=\"upvote('" + i + "')\">+</button><button class=\"btn btn-outline-default\" disabled>" + suggestions.suggestions[i].votes + "</button><button class=\"btn btn-outline-danger\" onclick=\"downvote('" + i + "')\">-</button></div>";
			var div = document.createElement("div");
			
			div.classList.add("card");
			div.classList.add("card-body");
			div.innerHTML = html;

			topic_box.appendChild(div);
			topic_box.innerHTML += "<br>";
		}
	}

}


function set_flags(suggestions) {
	for(i = 0; i < suggestions.suggestions.length; i ++) {
		if(!flag_names.includes(suggestions.suggestions[i].suggestion)) {
			flag_names.push(suggestions.suggestions[i].suggestion);
			flag_values.push(0);
		}
	}
}


