//All function specific to Caveman are stored in this file
const helper = require(__dirname + '/../../helper_functions.js');

exports.game_over = function(game) {
    return(game.player_has_zero_health());
}

exports.toolmaker = function (game, player, cards) {
    //toolmaker - treasure of one more value
    var tres = ["wood", "bone", "stone"];
    if(cards == null || !tres.includes(cards[0])) {
        var message = "Trash a Treasure from your hand and trade it for the next most valuable Treasure."
        game.player_choose(player, "hand", 1, 1, "trash a treasure", "toolmaker", message);
    } else if(cards.length == 1) {
        var i = Math.min((tres.indexOf(cards[0]) + 1), tres.length - 1);
        game.players[player].trash_card(game.players[player].hand.indexOf(cards[0]));
        game.players[player].add_card_to_hand(tres[i]);
	    game.send_to_log(player, "trashed a " + game.get_card_name(cards[0]) + " for a " + game.get_card_name(tres[i]));
    } 
}

exports.priest = function(game, player, cards) {
    //+1 health per card trashed
    if(cards == null) { //first time being called
        var message = "You can trash up to 2 cards, you will gain +1 health per card you trash."
        game.player_choose(player, "hand", 0, 2, "trash", "priest", message);
    } else { //cards have been selected
        game.players[player].deal_damage(-cards.length);
    }
}

exports.prophet = function(game, player, cards) {
    //prophet - top card from each deck shuffled and redistributed. Put into players hands.
    if(cards == null) {
        var top_cards = [];
        for(var p in game.players) {
            top_cards.push(game.players[p].draw_deck_cards(1)[0]);
        }
        var tops = top_cards.slice(0);
        var shuffled_top_cards = helper.shuffle(top_cards);
        for(var p in game.players) {
            game.players[p].add_to_top_of_deck(shuffled_top_cards[p]);
            if(p == player) {
                game.alert_player(p, "Your prophet has been busy! The top card in your deck was a '" + tops[p] + "'...\n...but it might not be anymore!");
            } else {
                game.alert_player(p, "Player" + player + " used a prophet. The top card in your deck was a '" + tops[p] + "'...\n...but it might not be anymore!");
            }
        }
        game.send_cards_to_all();
    }
}

exports.sacrifice = function(game, player, cards) {
    //sacrifice - trash card automatically
    if(cards == null) {
        game.players[player].trash_card(game.players[player].played.indexOf('sacrifice'),  "played"); //Trash card immediately
    }
}