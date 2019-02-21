//All functions specific to Ascension are stored in this file
const helper = require(__dirname + '/../../helper_functions.js');

exports.game_over = function(game) {
    //Game is over when honour runs out
    //30 honour per player
    var honour_per_player = 30;
    return game.total_additional_points() >= game.players.length * honour_per_player;
}

exports.templeofimmortality = function (game, player, cards) {
}

//-----MONSTERS
exports.hellfrostimps = function (game, player, cards) {
    //Keep taking hellfrost imps til they're gone
    while(game.get_dealt_cards().includes("hellfrostimps")) {
        game.purchase_from_pool(player, "Dealt" + game.get_dealt_cards().indexOf("hellfrostimps"), true);
    }
}

exports.kanzirtheravager = function (game, player, cards) {
    //Each opponent looses control of all Temples and Destroys all Constructs they control.
    game.for_each_other_player(player, function(game, p) {
        cards = game.players[p].played;
        if(cards.includes("templeofdeath")) {
            game.pools["Temple of Death"].cards = ["templeofdeath"]; //return temple
        }
        if(cards.includes("templeoflife")) {
            game.pools["Temple of Life"].cards = ["templeoflife"]; //return temple
        }
        if(cards.includes("templeofimmortality")) {
            game.pools["Temple of Immortality"].cards = ["templeofimmortality"]; //return temple
        }
        game.players[p].discard_all_played();
    })
}

exports.starvedabomination = function (game, player, cards) {
    life_keystone(game, player);
}

exports.hurrasseasfury = function (game, player, cards) {
    life_keystone(game, player);
    death_keystone(game, player);
}

exports.cryptlurker = function (game, player, cards) {
    death_keystone(game, player);
}

exports.ikuvalleytyrant = function (game, player, cards) {
    return;
}

exports.ikuvalleytyrant_discount = function (game, player, cards) {
    return 2 * num_temples(game, player);
}

exports.cavernhorror = function (game, player, cards) {
    if(cards == null) {
        var message = "You may shuffle your discard into your deck. To do so, select any card.";
        game.player_choose(player, "any", 0, 1, "shuffle discard", "cavernhorror", message);
    } else if(cards.length > 0) {
        game.players[player].shuffle_discard_into_deck();
        game.send_to_log(player, ": shuffled their discard into their deck");
    }
}

//-----LIFEBOUND
exports.burialguardian = function (game, player, cards) {
    //next time you acquire a lifebound hero this turn: Death Keystone
    if(cards == null) {//first time through
        //add callback
        game.players[player].add_callback("burialguardian"); 
    } else if(cards[1] == "acquired" && game.cards[cards[0]].faction == "lifebound"
     && game.cards[cards[0]].type == "hero") {
        //card has been acquired
        death_keystone(game, player);
        return true;
    }
}

exports.ancientstag = function (game, player, cards) {
    if(cards == null) {
        game.players[player].add_callback("ancientstag");
    } else if(cards[1] == "played" && unite(game, player, "lifebound")) { //card has been played and unite is triggered
            life_keystone(game, player);
            return true;
    }
}

exports.alosyanguide = function (game, player, cards) {
    return;
}
exports.alosyanguide_discount = function (game, player, cards) {
    for(var c in game.players[player].played) {
        if(game.cards[game.players[player].played[c]].faction == "lifebound" && game.cards[game.players[player].played[c]].type == "hero") {
            return "hand";
        }
    }
    return 0;
}

exports.pathfinderstotem = function (game, player, cards) {
    if(cards == null) {
        game.players[player].add_callback("pathfinderstotem");
    } else if(cards[1] == "played" && unite(game, player, "lifebound")) { //card has been played and unite is triggered
            game.players[player].add_to_round_stats("runes", 1);
            return true;
    }
}

//-----VOID
exports.soulsnarehunter = function (game, player, cards) {
    if(cards != null && cards[1] == "acquired" && game.cards[cards[0]].type == "monster") { //card has been played and unite is triggered
            life_keystone(game, player);
            return true;
    } else {
        game.players[player].add_callback("soulsnarehunter");
    }
}

exports.beaconofthelost = function (game, player, cards) {
    if(echo(game, player, "void")) {
        game.players[player].add_to_round_stats("power", 1);
    }
}

exports.spitefulgladiator = function (game, player, cards) {
    if(echo(game, player, "void")) {
        game.players[player].add_to_round_stats("power", 2);
    }
}

exports.shadowridgescout = function (game, player, cards) {
    if(echo(game, player, "void")) {
        death_keystone(game, player);
    }
}

//-----ENLIGHTENED
exports.sacredpot = function (game, player, cards) {
    if(cards == null) {
        if(serenity(game, player)) {
            game.players[player].draw_cards(1);
        } else {
            game.players[player].add_callback("sacredpot");
        }
    }
    if(cards != null && serenity(game, player)) {
        game.players[player].draw_cards(1);
        return true;
    }
}

exports.blindseer = function (game, player, cards) {
    if(serenity(game, player)) {
        life_keystone(game, player);
    }
}

exports.templaroutpost = function (game, player, cards) {
    if(cards == null || game.cards[cards[0]].type != "monster") {
        game.add_card(player, 4, "power", "templaroutpost")
    }
}

exports.islasereneprodigy = function (game, player, cards) {
    console.log(cards);
    if(cards != null && cards.length > 0 && (game.cards[cards[0]].type != "hero" || game.cards[cards[0]].type != "construct")) {
        game.players[player].shuffle_discard_into_deck();
    } else {
        game.add_card(player, Infinity, "runes", "islasereneprodigy");
    }
}

function unite(game, player, faction) {
    var num = 0; //need at least 2 of same faction played to unite.
    for(var c in game.players[player].played) {
        if(game.cards[game.players[player].played[c]].faction == faction) num ++;
        if(num > 1) return true;
    }
    return false;
}

function echo(game, player, faction) {
    //players discard must contain a card of the same faction
    for(var c in game.players[player].discard) {
        if(game.cards[game.players[player].discard[c]].faction == faction) return true;
    }
    return false;
}

function serenity(game, player) {
    //players discard must be emepty
    return game.players[player].discard.length == 0;
}

function death_keystone(game, player) {
    if(game.players[player].played.includes("templeofdeath")) { //already own temple
        steal_immortality(game, player);        
        var message = "You may banish a card from your hand";
        game.player_choose(player, "hand", 0, 1, "trash", null, message);
    } else { //do not own temple
        steal_death(game, player);
    }
}

function life_keystone(game, player) {
    if(game.players[player].played.includes("templeoflife")) { //already own temple
        steal_immortality(game, player);
        game.players[player].add_to_round_stats("honour", 2);
    } else { //do not own temple
        steal_life(game, player);
    }
}

function steal_life(game, player) {
    if(game.players[player].played.includes("templeoflife")) return;
    if(game.pools["Temple of Life"].cards.length < 1) {
        for(var p in game.players) {
            if(p == player) continue;
            if(game.players[p].played.includes("templeoflife")) {
                game.players[p].played.splice(game.players[p].played.indexOf("templeoflife"), 1);
                break;
            }
        }
    } else {
        game.pools["Temple of Life"].cards = [];
    }    
    game.players[player].played.push("templeoflife");
}

function steal_death(game, player) {
    if(game.players[player].played.includes("templeofdeath")) return;
    if(game.pools["Temple of Death"].cards.length < 1) {
        for(var p in game.players) {
            if(p == player) continue;
            if(game.players[p].played.includes("templeofdeath")) {
                game.players[p].played.splice(game.players[p].played.indexOf("templeofdeath"), 1);
                break;
            }
        }
    } else {
        game.pools["Temple of Death"].cards = [];
    }    
    game.players[player].played.push("templeofdeath");
}

function steal_immortality(game, player) {
    if(game.players[player].played.includes("templeofimmortality")) return;
    if(game.pools["Temple of Immortality"].cards.length < 1) {
        for(var p in game.players) {
            if(p == player) continue;
            if(game.players[p].played.includes("templeofimmortality")) {
                game.players[p].played.splice(game.players[p].played.indexOf("templeofimmortality"), 1);
                break;
            }
        }
    } else {
        game.pools["Temple of Immortality"].cards = [];
    }    
    game.players[player].played.push("templeofimmortality");
}

function num_temples(game, player) {
    var num = 0;
    for(var c in game.players[player].played) {
        if(game.players[player].played[c].includes("temple")) num ++;
    }
    return num;
}