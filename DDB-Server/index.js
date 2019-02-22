var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('./GameFiles/config.json');
var port = config.port;
var root = __dirname.split('\DDB-Server')[0]; //Get the base directory for the project

//directories for use:
app.use('/JavaScript', express.static(root + '/scripts'));
app.use('/images', express.static(root + '/images'));
app.use('/HTML', express.static(root + '/'));
app.use('/CSS', express.static(root + '/styles'));
//app.use('/', express.static(root + '/'));
//Default page to send when somone connects to the server
app.get('/', function(req, res){
  res.sendFile(root + '/ddb.html');
});

//Classes
const Game = require('./game.js');
const helper = require('./helper_functions');

var pending = []; //Clients connected but not in a game;
var players = []; //Keep track of current players
var games = []; //Keep track of current games


io.on('connection', function(socket) {
    // Listen on the connection event for incoming sockets and write to console
    
    //New player, let them choose the game they want
    pending.push(socket.id);
    console.log(socket.id + " joined the server");
    player_choose_game(socket.id);

    socket.on('test', function(message) {
        console.log(message);
    });
        
    socket.on('new', function() {
        //player has selected which games to play, add them to a game or create a new one
        pending.push(socket.id);
        emit_to_player(socket.id, 'reset', 'new game');
        player_choose_game(socket.id);
    });

    socket.on('game_selected', function(game) {
        //player has selected which games to play, add them to a game or create a new one
        add_player_to_game(socket.id, game);
        refresh_game_select_screen();
    });
    
    socket.on('pools_selected', function(pools) {
        //player has selected which pools they want to play with        
        var index = get_players_game_index(socket.id);
        if(index != -1) games[index].handle_pool_choose(pools);
    });

    socket.on('move', function(move) {
        //Player sends 'move' signal when attempting a move
        var index = get_players_game_index(socket.id);
        //Pass the move onto the game that the player is in
        if(index != -1) { games[index].make_move(socket.id, move); }
    });

    socket.on('end_phase', function() {
        //Player sends 'end_phase' signal when they are finished with the current phase of their turn
        var index = get_players_game_index(socket.id);
        //Pass the move onto the game that the player is in
        if(index != -1) { games[index].end_phase(socket.id); }
    });

    socket.on('disconnect', function() {
        //Remove player from game
        var index = get_players_game_index(socket.id);
        if(index != -1) { games[index].remove_player(socket.id); } //remove from game object
        else { pending.splice(pending.indexOf(socket.id)); } //if not in game remove them from pending list
        
        if(index != -1 && games[index].players.length < games[index].game_data.min_players) {
            //If the game has too few people in it: remove it
            if(games[index].started) {
                //Too few people to continue the game
                //Let anyone still on the server know
                emit_to_each_player_in_game(index, 'unexpected', 'too few players');
                console.log("game" + index + " had too few players and is shutting");
            }
            //Remove game
            remove_game(index);
            console.log("game" + index + " has been removed");
        }
        console.log(socket.id + " disconnected: " + index);
        refresh_game_select_screen();
    })
});

http.listen(port, function(){
    //Listen on specified port for connections
    console.log('listening on port:' + port);
});

function emit_to_each_player_in_game(game, topic, msg) {
    //Sends a message to all the players in a given game
    //Sends message 'msg' on topic 'topic' to all players in the game with index 'game'
    for(var p in games[game].players) {
        emit_to_player(games[game].players[p].socket, topic, msg);
    }
}

var emit_to_player = function(id, topic, msg) {
    //Sends a message to a player
    io.to(id).emit(topic, msg);
}

function player_choose_game(id) {
    //Tells the client to choose which game they would like to play
    //once this is done the server will connect them to a game of this type;
    setTimeout( function() {
        var open_games = get_open_games();
        var new_games = Object.keys(config.games);
        for(var g in new_games) {
            new_games[g] = { name: new_games[g], index: new_games[g] };
        }
        var games = { new: new_games, old: open_games };
        emit_to_player(id, 'choose_game', games); 
    }, 300);
}


function add_player_to_game(id, game) {
    console.log(game);
    if(game.type == "new") {
        //None exist -> create new one
        var game_id = 0;
        if(games.length != 0) { game_id = games[games.length - 1].game_id + 1; }
        games.push(new Game(config.games[game.index], game_id));
        games[games.length - 1].add_player(id);
        players.push([id, game_id]);
    } else if(game.type == "old") {
        //Add player to existing game
        if(!games[game.index].full && !games[game.index].started) {
            games[game.index].add_player(id);
            players.push([id, games[game.index].game_id]);
        }
    }

    pending.splice(pending.indexOf(id), 1);
    refresh_game_select_screen();
}

function get_players_game_index(id) {
    //look through list of players searching for player with an id of 'id'. When found return the game id, otherwise -1
    game_id = -1;
    for(var p in players) {
        if(players[p][0] == id) { game_id = players[p][1]; }
    }
    for(var g in games) {
        if(games[g].game_id == game_id) { return g; }
    }
    return -1;
}

function refresh_game_select_screen() {
    for(var p in pending) {
        player_choose_game(pending[p]);
    }
}

function get_open_games() {
    //find all current games that are not full and not started yet
    var open_games = [];
    for(var g in games) {        
        if(!games[g].started && !games[g].full) { 
            var title = games[g].game_data.title + " (" + games[g].players.length + "/" + games[g].game_data.max_players + " players)";
            open_games.push({ name: title, index: g});
        }
    }
    return open_games;
}

var game_over = function(id) {
    console.log(pending);
    //game is over, remove players from players list and add them back to the pending list
    for(var p in games[id].players) {
        var socket = games[id].players[p].socket;
        players.splice(players.indexOf([socket, id]), 1);
    }
    console.log(pending);
}

function remove_game(id) {
    //remove game from list of available games
    games.splice(id, 1);
}

exports.emit_to_player = emit_to_player;
exports.game_over = game_over;