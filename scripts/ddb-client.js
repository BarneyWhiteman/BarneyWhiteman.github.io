var socket = io();

var hand = [];
var played = [];
var current_stats = "";
var pool = [];

var pools = [];
var pools_chosen = true;
var choose_pool;

var move = [];

var chat_width = 300 + 50;

var buttons = [];
var initial_buttons = [];

var max_card_width;

var choosing = false; //Variables for allowing players to choose cards (ie for "discard 4 cards");
var choose_place = "";
var num_selected = 0;
var min_selected = 0;
var max_selected = 0;
var price = 0;
var prev_button_state = true;

var revealed_display = false;
var revealed_cards = [];

var alert_display = false;
var alert_message = "";

var tl = 10;

var started = false; //game has not begun
var ready = false;
var selected = false;
var over = false; //When the game ends naturally
var unexpected_over = false; //if people leave the game;

var paused = false;
var open_games = false;

var text_lrg = 30;
var text_med = 25;
var text_sml = 15;
var text_min = 12;

var spc = 10;

var unexpected_button;

function setup() {
	var cnv = createCanvas(window.innerWidth - chat_width, window.innerHeight - 75);
	cnv.canvas.style.float = 'right';
	max_card_width = width/6;
	text_lrg = min(width, height)/30;
	text_med = min(width, height)/40;
	text_sml = min(width, height)/50;
	text_min = min(width, height)/60;
	stroke(51);
	noFill();
	textAlign(CENTER, CENTER);
	textSize(text_lrg);
	buttons.push(new Button(width/2 - 100, height/2 - 50, 200, 100, "Ready!", 255, function() { //Used for starting game
		if(!ready && selected) {
			ready = true;
			socket.emit('move', {type: 'ready'} );
		}
	}));
	buttons.push(new Button(width * 7/8, height * 3/4, width/8 - 1, height/4, "Not your turn", "#ddffdd", function() { //Used for ending a phase
		if(started) {
			if(choosing) {
				end_choosing();
			} else {
				end_current_phase();
			}
			return;
		}
	}));
	buttons[1].disabled = true;
	unexpected_button = new Button(width/2 - 100, 2/3 * height - 50, 200, 100, "Back to game selection", 255, function() { //Returning to gameselection
		if(unexpected_over || !ready) {
			socket.emit('new', 'new game pls');
		}
	});

	loop();
}

function windowResized() {
	//resizes cards, pools etc when the window is resized
	var ratio_x = (window.innerWidth - chat_width)/width;
	var ratio_y = (window.innerHeight - 75)/height;
	for(var c in hand) {
		hand[c].resize(ratio_x, ratio_y);
	}
	for(var c in pool) {
		pool[c].resize(ratio_x, ratio_y);
	}
	for(var c in pools) {
		pools[c].resize(ratio_x, ratio_y);
	}
	for(var b in buttons) {
		buttons[b].resize(ratio_x, ratio_y);
	}
	for(var b in initial_buttons) {
		initial_buttons[b].resize(ratio_x, ratio_y);
	}
	unexpected_button.resize(ratio_x, ratio_y);
	resizeCanvas(window.innerWidth - chat_width, window.innerHeight - 75);
	max_card_width = width/6;
	text_lrg = min(width, height)/30;
	text_med = min(width, height)/40;
	text_sml = min(width, height)/50;
	text_min = min(width, height)/60;
}

function draw() {
	background(255);
	textSize(text_lrg);
	stroke(51);
	noFill();
	textAlign(CENTER, CENTER);
	if(unexpected_over) {
		draw_unexpected();
	} else if(!started) {
		if(!selected) {
			draw_game_select();
		} else if(!pools_chosen) {
			draw_pool_select();
		} else if(!ready) {
			buttons[0].show();
		} else {
			stroke(0, 200, 0);
			noFill();
			rect(width/2 - 100, height/2 - 50, 200, 100);
			fill(0, 200, 0);
			noStroke();
			text("Waiting", width/2, height/2);
		}
	} else {
		draw_grid();
		draw_cards();
	}
	if(revealed_display || alert_display) {
		display_alert_reveal();
	}
}

function draw_game_select() {
	fill(51);
	noStroke();
	text("Start a new game", width/2, height/4);
	if(open_games) {	text("Or join one!", width/2, height/2); }
	for(b in initial_buttons) {
		initial_buttons[b].show();
	}
}

function draw_pool_select() {
	fill(51);
	noStroke();
	text("Please select the pools you want to play with (" + num_selected + "/" + min_selected + ")", width/2, height/8);
	for(var c in pools) {
		pools[c].show();
	}
	textAlign(CENTER, CENTER);
	choose_pool.show();
	random_pool.show();
}

function draw_grid() {
	stroke(51);
	fill(255);
	//STATS
	line(width/8, height, width/8, height - height/4);
	//SEND/END
	line(7 * width/8, height, 7 * width/8, height - height/4);
	//HAND
	line(0, height - height/4, width, height - height/4);
	//PLAYED
	line(0, height/2, width, height/2);
	
	noStroke();
	fill(0);
	textSize(text_med);
	text('Stats', width/16, height * 25/32);
	fill(150);
	text('Played Cards', width/2, 5 * height/8)
	fill(0)
	textSize(text_sml);
	textAlign(LEFT, TOP);
	text(current_stats, 5, 13/16 * height, width/8 - spc, height/4 - spc);
}

function draw_cards() {
	textAlign(LEFT, TOP);
	for(i in hand) {
		hand[i].show();
	}
	for(i in played) {
		played[i].show();
	}
	for(i in pool) {
		pool[i].show();
	}
	textAlign(CENTER, CENTER);
	buttons[1].show();
}

function draw_unexpected() {
	//Display message for unexpected finish
	unexpected_button.show();
	fill(255, 0, 0);
	noStroke();
	text("Player(s) unexpectedly left the server", width/2, height/2);
}

function display_alert_reveal() {
	textSize(text_lrg);
	fill(100, 100);
	noStroke();
	rect(0, 0, width, height);
	fill(250);
	stroke(51);
	rect(width/8, height/8, 3/4 * width, 3/4 * height);
	line(width/8, 3/16 * height, 7/8 * width, 3/16 * height);
	fill(51);
	noStroke();
	if(revealed_display) {
		text("Revealed Cards", width/2, 5/32 * height);
		buttons[2].show();
		textSize(text_med);
		var d = (9/16 * height)/(revealed_cards.length + 1); //dist between texts
		for(var c  = 0; c < revealed_cards.length; c ++) {
			text(revealed_cards[c], width/2, (3/16 * height) + (d * (c + 1)));
		}
	} else if(alert_display) {
		text("Alert!", width/2, 5/32 * height);
		buttons[2].show();
		textSize(text_med);
		textAlign(CENTER, TOP);
		text(alert_message, width/8, 1/4 * height, 3/4 * width, 5/8 * height);
		textAlign(CENTER, CENTER);
	}
}

function mouseReleased() {
	for(b in buttons) {
		if((pools_chosen || alert_display) && buttons[b].pressed()) { buttons[b].func(); return; }
	}
	if(!started) {
		for(b in initial_buttons) {
			if(pools_chosen && initial_buttons[b].pressed()) { initial_buttons[b].func(); return; }
		}
	}

	if(unexpected_over) {
		if(unexpected_button.pressed()) { unexpected_button.func(); return; }
	}

	if(!pools_chosen) {
		if(choose_pool.pressed()) { choose_pool.func(); return; }
		if(random_pool.pressed()) { random_pool.func(); return; }
		
		for(var i in pools) {
			if(pools[i].pressed() && choosing && choose_place == "pool_selection") {
				if(pools[i].selected) {
					num_selected --;
					pools[i].selected = false;
				} else if(!pools[i].selected && num_selected < max_selected) {
					num_selected ++;
					pools[i].selected = true;
				}
				return;
			}
		}
	}
	if(started && !alert_display && !revealed_display) {
		for(i in hand) {
			if(hand[i].pressed()) {
				if(choosing && (choose_place == "hand" || choose_place == "any")) {
					if(hand[i].selected) {
						num_selected --;
						hand[i].selected = !hand[i].selected;
					} else if(!hand[i].selected && num_selected < max_selected) {
						num_selected ++;
						hand[i].selected = !hand[i].selected;
					}
				} else if(!choosing) {
					make_move({type: "hand", index: i});
				}				
				return;
			}
		}
		for(i in pool) {
			if(pool[i].pressed()) {
				if(choosing && (choose_place == "pool" || choose_place == "any")) {
					if(pool[i].selected) {
						num_selected --;
						pool[i].selected = !pool[i].selected;
					} else if(!pool[i].selected && num_selected < max_selected) {
						num_selected ++;
						pool[i].selected = !pool[i].selected;
					}
				} else if(!choosing) {
					make_move({type: "pool", index: pool[i].pool});
				}
				return;
			}
		}
	}
}

function make_move(move) {
	socket.emit('move', move);
}

function end_current_phase() {
	socket.emit('end_phase', 'end_phase');
}

//Checks if point (x, y) is inside the box bounded by box with top left corner
//of (bx, by), with width bw and height bh
//Used to see if the mouse is inside a GUI element
function point_in_box(x, y, bx, by, bw, bh) {
	return(x > bx && x < bx + bw &&  y > by && y < by + bh);
}


//ALL SOCKET THINGS HERE
//listen on the socket for instructions
socket.on('test', function(message) {
    console.log(message);
});

socket.on('pause', function(pause) {
    paused = pause;
});

socket.on('unexpected', function() {
	//game ends unexpectedly
	unexpected_over = true;
	alert_display = false;
});

socket.on('over', function() {
	//game is over
	over = true;
});

socket.on('started', function() {
	//game has started
	started = true;
});

socket.on('reset', function() {
	//client should be reset
	reset();
});

socket.on('new', function() {
	//joined a game
	started = false;
	ready = false;
	over = false;
	unexpected_over = false;
	document.getElementById("player_log").innerText = "";
});

socket.on('log', function(message) {
	//add message to player log
	document.getElementById("player_log").innerText = message + "\n" + document.getElementById("player_log").innerText;
});

socket.on('hand', function(cards) {
	//player hand is being sent
	//Create card objects for each card in the hand
	var w = min((6 * width/8 - spc)/cards.length, max_card_width);
	var temp = [];
	for(c in cards) {
		temp.push(new Card(width/8 + c * w + spc, height - (height/4 - spc), w - spc, height/4 - 20, cards[c].name, cards[c].desc, cards[c].col));
	}
	hand = temp;
});

socket.on('played', function(cards) {
	//player played cards are being sent
	var w = min((width - spc)/cards.length, max_card_width);
	var temp = [];
	for(c in cards) {
		temp.push(new Card(c * w + spc, height/2 + spc, w - spc, height/4 - 20, cards[c].name, cards[c].desc, cards[c].col));
	}
	played = temp;
});

socket.on('stats', function(stats) {
	//player stats are being sent
	current_stats = stats;
});

socket.on('pool', function(cards) {
	//game pools are being sent
	//Only need to display the top cards from each pool
	var num = [0, 0];
	for(c in cards) {//find num of cards in each row
		if(cards[c].type == "constant") num[0] ++;
		else num[1] ++;
	}
	var n = max(num[0], num[1]);
	var w = min((width - spc)/n, max_card_width); //get card width
	var temp = [];
	var rows = [0, 0];
	var row = 0;
	var offset = 0;
	for(c in cards) {
		if(cards[c].type == "constant") {
			row = 0;
		} else {
			row = 1;
		}
		offset = rows[row] * w;
		temp.push(new Card(offset + spc, (height/4 * row) + spc, w - spc, height/4 - 20, cards[c].name, cards[c].desc, cards[c].col));
		temp[temp.length - 1].num = cards[c].num;
		temp[temp.length - 1].pool = cards[c].pool;
		rows[row] += 1;
	}
	pool = temp;
});

socket.on('revealed', function(cards) {
	//Displays cards revealed by other players
	buttons[1].disabled = true;
	revealed_display = true;
	revealed_cards = cards;
	buttons.push(new Button(width/8, height/8, width/8, height/16, "Close", "#ffaaaa", function() { //Used for closing the reveal panel
		buttons[1].disabled = false;
		revealed_display = false;
		buttons.splice(2, 1);
	}));
});

socket.on('choose_game', function(games) {
	//shows which games can be played
	open_games = false;
	reset();
	var new_game = games.new;
	var old_game = games.old;
	//Allows the client to select the game they want from the available configurations
	//New games
	var startX = 0;
	var size = min(max_card_width * 1.5, width/new_game.length);
	if((size + spc) * new_game.length - spc > width) {
		size = width/new_game.length - spc;
	} else {
		startX = width/2 - ((size + spc) * new_game.length - spc)/2
	}
	if(new_game.length == 0) {
		initial_buttons.push(new Button(width/2 - size/2, 5/16 * height, size, height/8, "No games available", [255, 200, 200], function() {}));
	} else {
		for(var g in new_game) {
			var name = new_game[g].name;
			let index = new_game[g].index;
			var c = [random(150, 255), random(150, 255), random(150, 255)];
			initial_buttons.push(new Button(startX + g * (size + spc), 5/16 * height, size, height/8, name, c, function() { //Used for selecting a game
				if(!selected) {
					selected = true;
					socket.emit('game_selected', {type: "new", index: index});
				}
			}));
		}
	}
	//Already open games
	if(old_game.length > 0) {
		open_games = true;
		startX = 0;
		size = min(max_card_width * 1.5, width/old_game.length);
		if((size + spc) * old_game.length - spc > width) {
			size = width/old_game.length - spc;
		} else {
			startX = width/2 - ((size + spc) * old_game.length - spc)/2
		}
		for(var g in old_game) {
			var name = old_game[g].name;
			let index = old_game[g].index;
			var c = [random(150, 255), random(150, 255), random(150, 255)];
			initial_buttons.push(new Button(startX + g * (size + spc), 9/16 * height, size, height/8, name, c, function() { //Used for selecting a game
				if(!selected) {
					selected = true;
					socket.emit('game_selected', {type: "old", index: index});
				}
			}));
		}
	}
});

socket.on('choose_pool', function(pools_to_select) {
	//Allows the client to select the pools they want to play with
	prev_phase = buttons[1].text;
	prev_button_state = buttons[1].disabled;

	min_selected = pools_to_select.num;
	max_selected = min_selected;
	num_selected = 0;
	choosing = true;
	pools_chosen = false;
	choose_place = "pool_selection"
	cards = pools_to_select.pools;

	var n = ceil(cards.length/4);
	var w = min((width - 10)/n, max_card_width);
	var temp = [];
	var row = 0;
	//Create card objects for each card in the hand
	var temp = [];
	for(c in cards) {
		row = floor(c/n);
		var offset = n * w * row;
		temp.push(new Card(c * w + 10 - offset, (height/8 * row) + height/4 - 10, w - 10, height/8 - 20, cards[c], ""));
	}
	pools = temp;
	choose_pool = new Button(1/3 * width - max_card_width/2, 3/4 * height, max_card_width, height/8, "End Pool Selection", "#aaffdd", function() {
		if(end_choosing()) {
			pools_chosen = true;
		}
	});
	random_pool = new Button(2/3 * width - max_card_width/2, 3/4 * height, max_card_width, height/8, "Use Random Pools", "#ffaadd", function() {
		pools_chosen = true;
		choosing = false;
		socket.emit('pools_selected', 'random');
	});
});

socket.on('phase', function(phase) {
	//Populates text in end_phase button
	buttons[1].disabled = false;
	buttons[1].text = "End " + phase;
});

socket.on('choose', function(data) {
	//Allows the player to select a card for various reasons (discard/trash etc)
	deselect_all();
	choosing = true;
	prev_button_state = buttons[1].disabled;
	buttons[1].disabled = false;
	choose_place = data.place;
	num_selected = 0;
	min_selected = data.min;
	max_selected = data.max;
	price = data.price;
	prev_phase = buttons[1].text;
	buttons[1].text = "End " + data.type;
});


socket.on('disable', function() {
	//Disbales end_phase button when it's not the players turn
	buttons[1].disabled = true;
	buttons[1].text = "Not your turn";
});

socket.on('alert', function(message) {
	//Alerts players (used for start/end of turn)
	custom_alert(message);
});

function custom_alert(message) {
	buttons[1].disabled = true;
	alert_display = true;
	alert_message = message;
	buttons.push(new Button(width/8, height/8, width/8, height/16, "Close", "#ffaaaa", function() { //Used for closing the reveal panel
		buttons[1].disabled = false;
		alert_display = false;
		buttons.splice(2, 1);
		if(over) {
			socket.emit('new', 'reset');
		}
	}));
}

function end_choosing() {
	if(num_selected >= min_selected && num_selected <= max_selected) {
		var selected = [];
		if(choose_place == "hand" || choose_place == "any") {
			for(var c in hand) {
				if(hand[c].selected) selected.push(c);
			}
		} else if(choose_place == "pool" || choose_place == "any") {
			for(var c in pool) {
				if(pool[c].selected) {
					if(price != null && pool[c].get_cost() > price) {
						custom_alert("Please choose a card costing " + price + " or less");
						return false;
					}
					selected.push(pool[c].pool);
				}
			}
		}
		if(choose_place == "pool_selection") {
			for(var c in pools) {
				if(pools[c].selected) {
					selected.push(c);
				}
			}
			socket.emit('pools_selected', selected);
		} else {
			make_move({ type: "choose", place: choose_place, selected: selected});
		}
		deselect_all();		
		choosing = false;
		buttons[1].text = prev_phase;
		buttons[1].disabled = prev_button_state;
		return true;
	} else {
		if(min_selected == max_selected) {
			custom_alert("Please choose " + min_selected + " cards");
		} else {
			custom_alert("Please choose between " + min_selected + " and " + max_selected + " cards");
		}
		return false;
	}
}

function deselect_all() {
	for(var c in hand) {
		hand[c].selected = false;
	}
	for(var c in pool) {
		pool[c].selected = false;
	}
	for(var c in pools) {
		pools[c].selected = false;
	}
}

class Card {

	constructor(x, y, w, h, name, desc, colour) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.selected = false;
		this.num = null;
		this.name = name;
		this.desc = desc
		if(colour == null) { 
			this.colour =[255, 255, 255];
		} else {
			this.colour = colour;
		}
	}

	resize(rx, ry) {
		this.x *= rx;
		this.w *= rx;
		this.y *= ry;
		this.h *= ry;
	}

	get_cost() {
		var si = this.desc.indexOf("Cost: ") + "Cost: ".length;
		var ei = this.desc.indexOf(" ", si);
		var num = this.desc.substring(si, ei);
		return Number(num);
	}

	show() {
		textAlign(LEFT, TOP);
		if(this.selected && choosing) {
			stroke(0, 255, 255);
			fill(0, 255, 255);
			rect(this.x, this.y, this.w, this.h);
		} else {
			stroke(51);
			fill(this.colour[0], this.colour[1], this.colour[2]);
			rect(this.x, this.y, this.w, this.h);
		}
		fill(this.colour[0] + 100, this.colour[1] + 100, this.colour[2] + 100);
		noStroke();
		//fill(255);
		rect(this.x + 5, this.y + 5, this.w - spc, this.h - spc);
		fill(51);
		noStroke();
		textSize(text_med);
		text(this.name, this.x + 5, this.y + 5, this.w - spc, 1/8 * this.height - spc);
		textSize(text_min);
		text(this.desc, this.x + 5, this.y + this.h/8 + 5, this.w - spc, 7/8 * this.h - spc);
		if(this.num != null) {
			//display number of card left (used for pools);
			fill(this.colour[0], this.colour[1], this.colour[2]);
			ellipse(this.x + this.w - 15, this.y + this.h - 15, 30, 30);
			fill(255);
			textAlign(CENTER, CENTER)
			text(this.num, this.x + this.w - 15, this.y + this.h - 15);
		}
	}

	pressed() {
		return point_in_box(mouseX, mouseY, this.x, this.y, this.w, this.h);
	}
}

class Button {
	constructor(x, y, w, h, text, colour, func) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.text = text;
		this.colour = color(colour);
		this.disabled = false;
		this.func = func;
	}

	func() {
		this.func();
	}

	resize(rx, ry) {
		this.x *= rx;
		this.w *= rx;
		this.y *= ry;
		this.h *= ry;
	}

	show() {
		textSize(text_lrg);
		stroke(51)
		fill(this.colour);
		if(this.disabled || this.pressed()) {
			fill(red(this.colour) - 50, green(this.colour) - 50, blue(this.colour) - 50);
		}
		rect(this.x, this.y, this.w, this.h);
		fill(51);
		
		noStroke();
		text(this.text, this.x, this.y, this.w, this.h);
	}

	pressed() {
		return point_in_box(mouseX, mouseY, this.x, this.y, this.w, this.h) && !this.disabled;
	}
}

function reset() {
	document.getElementById("player_log").innerHTML = "";
	socket = io();
	hand = [];
	played = [];
	current_stats = "";
	pool = [];
	move = [];
	chat_width = 300 + 50;
	buttons = [];
	initial_buttons = [];
	max_card_width;
	choosing = false; //Variables for allowing players to choose cards (ie for "discard 4 cards");
	choose_place = "";
	num_selected = 0;
	min_selected = 0;
	max_selected = 0;
	price = 0;
	revealed_display = false;
	revealed_cards = [];
	alert_display = false;
	alert_message = "";
	started = false; //game has not begun
	ready = false;
	selected = false;
	over = false; //When the game ends naturally
	unexpected_over = false; //if people leave the game;
	paused = false;
	open_games = false;

	setup();
}