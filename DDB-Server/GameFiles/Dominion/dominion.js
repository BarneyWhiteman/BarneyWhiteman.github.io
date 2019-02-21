//All functions specific to Dominion are stored in this file
const helper = require(__dirname + '/../../helper_functions.js');

exports.game_over = function (game) {
    //Checks for game over
    if(game.pool_empty("Province") || game.num_pool_empty() >= 3) return true;
    return false;
}

exports.cellar = function(game, player, cards) {
    if(cards == null) { //first time being called
        var message = "You can discard as many cards as you like, they will be replaced by new cards from your deck."
        game.player_choose(player, "hand", 0, game.players[player].hand.length, "discard", "cellar", message);
    } else { //cards have been selected
        game.players[player].draw_cards(cards.length);
    }
}

exports.chancellor = function (game, player, cards) {
    if(cards == null) {
        var message = "You can immideiately put your deck into your discard. To do so, select any card.";
        game.player_choose(player, "any", 0, 1, "discard deck", "chancellor", message);
    } else if(cards.length > 0) {
        game.players[player].discard_deck();
        game.send_to_log(player, ": discarded entire deck");
    }   			
}

exports.feast = function (game, player, cards) {
    if(cards != null) { //on callback
        game.players[player].trash_card(game.players[player].played.indexOf('feast'),  "played"); //Trash card immediately
    }
}

exports.militia = function(game, player, cards) {
    if(cards == null) {
        game.for_each_other_player(player, function(game, p) {
            if(game.players[p].hand.includes("moat")) {//check if the player posesses a moat
                game.alert_player(p, "Your Moat has blocked a Militia attack");
            } else if(game.players[p].hand.length > 3) {
                var num_discard = game.players[p].hand.length - 3;
                var message = "You are being attacked by a Militia. You must discard " + num_discard + " cards from your hand so that you only have 3 remaining.";
                game.player_choose(p, "hand", num_discard, num_discard, "discard", null, message);
            } else {
                game.alert_player(p, "You're lucky you have so few cards, you avoided the Militia!");
            }
        });
    }
}

exports.moneylender = function (game, player, cards) {
    if(cards != null && cards.length == 1 && cards[0] == "copper") {
        game.players[player].trash_card(game.players[player].hand.indexOf(cards[0]));
        game.players[player].add_to_round_stats("treasure", 3);
	    game.send_to_log(player, ": trashed a cooper for +3 Treasure");
    } else {
        var message = "You may trash a copper from your hand. If you do you will get +3 Treasure."
        game.player_choose(player, "hand", 0, 1, "trash a copper", "moneylender", message);
    } 
}

exports.remodel = function (game, player, cards) {
    if(cards == null) {
    } else if(cards.length == 1) {
	    game.add_card(player, game.get_card_cost(cards[0]) + 2, "treasure");
    } 
}

exports.bureaucrat = function (game, player, cards) {
    if(cards == null) {
        if(!game.pool_empty("Silver")) {
            game.pools["Silver"].cards.splice(0, 1); //Remove top silver card
            game.players[player].add_card_to_discard("silver");
        }
        var revealed = [];
        for(var p in game.players) {
            if(p == player) continue;
            if(game.players[player].hand.includes("moat")) {
                game.alert_player(p, "Your Moat just blocked a Bureacrat Attack");
            }
            var player_cards = game.players[p].reveal_from_hand(function(hand) {
                var cards = [];
                for(var c in hand) {
                    if(game.get_card_type(hand[c]) == "victory") {
                        cards.push(game.get_card_name(hand[c]));
                        game.players[p].add_to_top_of_deck_from_hand(c);
                        break;
                    }
                }
                if(cards.length == 0) {
                    for(var c in hand) {
                        cards.push(game.get_card_name(hand[c]));
                    }
                }
                return cards;
            });
            revealed.push("Player" + p + " revealed: " + player_cards.join(", "));
            game.alert_player(p, "You got attacked by a Bureacrat and had to reveal your " + player_cards.join(", "));
        }
        game.emit_to_player(player, "revealed", revealed);
    } else { //callback

    }
}

exports.gardens = function (game, player) {
    //1vp per 10 cards (round down)
    return Math.floor(game.players[player].all_cards().length/10);
}

exports.council_room = function (game, player, cards) {
    if(cards == null) {
        game.for_each_other_player(player, function(game, p) {
            game.players[p].draw_cards(1);
        });
    }
}

exports.mine = function (game, player, cards) {
    var tres = ["copper", "silver", "gold"];
    if(cards == null || !tres.includes(cards[0])) {
        var message = "Trash a Treasure from your hand and trade it for the next most valuable Treasure."
        game.player_choose(player, "hand", 0, 1, "trash a treasure", "mine", message);
    } else if(cards.length == 1 && tres.includes(cards[0])) {
        var i = Math.min((tres.indexOf(cards[0]) + 1), tres.length - 1);
        game.players[player].trash_card(game.players[player].hand.indexOf(cards[0]));
        game.players[player].add_card_to_hand(tres[i]);
	    game.send_to_log(player, ": trashed a " + game.get_card_name(cards[0]) + " for a " + game.get_card_name(tres[i]));
    }   			
}

exports.witch = function (game, player, cards) {
    if(cards == null) {
        game.for_each_other_player(player, function(game, p) {
            if(game.players[p].hand.includes("moat")) {//check if the player posesses a moat
                game.alert_player(p, "Your Moat has blocked a Witch attack");
            } else if(!game.pool_empty("curse")) {
                game.pools[game.get_pool_index("curse")].splice(0, 1);
                game.players[p].add_card_to_discard("curse");
                game.alert_player(p, "You got attacked by a Witch and have been cursed");
            } else {
                game.alert_player(p, "You're lucky there are no more curses left!");
            }
        });
    }
}