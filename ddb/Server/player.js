const helper = require('./helper_functions.js');
class Player {

	constructor(cards, draw_size, default_round_stats, card_data, stat_types, health, socket) {
		this.deck = helper.shuffle(cards);
		this.socket = socket;
		this.discard = [];
		this.ready = false;
		this.draw_size = draw_size;
		this.hand = this.draw_deck_cards(draw_size);
		this.played = [];
		this.default_round_stats = default_round_stats;
		this.current_round_stats = {};
		this.num_trashed = 0;
		this.choosing = false;
		this.choose_type = "";
		this.add_card_price = 0;
		this.add_card_currency = "";
		this.callback = null;
		this.card_data = card_data;
		this.stat_types = stat_types;
		this.points = 0;
		this.callbacks = [];
		this.name;
		this.health = health;
		this.new_round();
	}

	set_name(name) {
		this.name = name;
	}

	draw_deck_cards(num) {
		//check if deck contains enough cards
		if(num > this.deck.length) {
			var temp = [];
			var len = this.deck.length;
			//draw all cards left in the deck
			temp = temp.concat(this.deck.splice(0, len));
			this.refresh_deck();
			//draw remaining cards from new deck
			temp = temp.concat(this.deck.splice(0, num - len));
			return temp;
		} else {
			//take the top cards from the deck
			return(this.deck.splice(0, num));
		}
	}

	refresh_deck() {
		//Shuffles the discard into the deck;
		this.deck = helper.shuffle(this.discard);
	}

	shuffle_discard_into_deck() {
		this.decl = this.deck.concat(helper.shuffle(this.discard));
	}

	add_to_round_stats(stat, value) {
		if(!this.stat_types.includes(stat)) return; //Only add stats if they are allowed in this game
		if(this.current_round_stats[stat] == null) {
			//if the stat does not exist, create it
			this.current_round_stats[stat] = value;
		} else {
			//if it does exist, add to old value
			this.current_round_stats[stat] += value;
		}
	}

	deal_damage(amount) {
		this.health -= amount;
	}

	new_round() {
		//resets the player ready for a new round
		this.current_round_stats = Object.assign({}, this.default_round_stats); //Semi-deep copy the default stats to begin round
		this.callbacks = [];
	}

	end_round() {
		//cleans up after a players turn
		this.new_hand();
	}

	play_card(index) {
		//Moves cards from the hand to the played array	
		if(index == null) return;
		this.played = this.played.concat(this.hand.splice(index, 1)); //copy values over and remove cards from hand
	}

	trash_card(index, location) {
		var card;
		//removes card from index in location
		if(location == null) { //default to hand
			card = this.hand.splice(index, 1);
			this.num_trashed += 1;
		} else if(location == "played") {
			card = this.played.splice(index, 1);
			this.num_trashed += 1;
		} else if(location == "discard") {
			card = this.discard.splice(index, 1);
			this.num_trashed += 1;
		}
		return card;
	}
	
	discard_deck() {
		this.discard = this.discard.concat(this.deck);
		this.deck = [];
	}
	
	discard_card(index) {
		//removes card from index in hand and puts it in the discard
		console.log("discarding  a " + this.hand[index]);
		this.discard = this.discard.concat(this.hand.splice(index, 1));
	}

	draw_cards(num) {
		this.hand = this.hand.concat(this.draw_deck_cards(num));
	}

	add_to_top_of_deck_from_hand(index) {
		//move the card at index in hand to the top of the deck
		this.deck = this.hand.splice(index, 1).concat(this.deck);
	}

	add_to_top_of_deck(card) {
		this.deck = [card].concat(this.deck);
	}

	add_card_to_deck(card) {
		this.deck.push(card);
	}

	add_card_to_discard(card) {
		this.discard.push(card);
	}

	add_card_to_hand(card) {
		this.hand.push(card);
	}

	add_points(num) {
		this.points += num;
	}

	discard_all_played() {
		this.discard = this.discard.concat(this.played);
		this.played = [];
	}

	new_hand() {
		//discards old cards and deals a new hand
		var temp = [];
		for(var c = this.played.length - 1; c >= 0; c --) {
			if(this.card_data[this.played[c]].persistent == null) {
				temp.push(this.played.splice(c, 1)[0]); //save cards that persist
			}
		}
		this.discard = this.discard.concat(temp, this.hand); //Add played and unplayed cards to discard
		this.hand = this.draw_deck_cards(this.draw_size); //Draw a new hand
	}

	all_cards() {
		//returns all the cards the player has (used for score calc)
		return [].concat(this.deck, this.hand, this.played, this.discard);
	}

	reveal_from_hand(func) { //takes a function to look at cards in the hand to be revealed. Function can select cards
		return func(this.hand);;
	}

	all_stats_zero() {
		for(var s in this.current_round_stats) {
			if(this.current_round_stats[s] != 0) return false;
		}
		return true;
	}

	add_callback(function_name) {
		//call back functions for things like constructs
		this.callbacks.push(function_name);
	}

	run_callbacks(game, player, card, location) { 
		for(var c = this.callbacks.length - 1; c >= 0; c --) {
			try {
				console.log(this.callbacks, card, location);
				if(game.game_functions[this.callbacks[c]](game, player, [card, location]) == true) {
					console.log("Success - " + this.callbacks);
					this.callbacks.splice(c, 1);
				}
			} catch(e) {
				console.log("Error in callback '" + this.callbacks[c] + "'");
				console.log(e);
			}
		}
	}

};

module.exports = Player;