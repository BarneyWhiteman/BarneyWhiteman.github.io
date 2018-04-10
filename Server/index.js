var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;
var root = __dirname.split('\Server')[0];
var db = root + "/data/suggestions.json";
var suggestions;

app.use('/scripts', express.static(root + '/scripts'));
app.use('/', express.static(root));
//Default page to send when somone connects to the server
app.get('/', function(req, res){
  res.sendFile(root + '/index.html');
});

load_suggestions();

// Listen on the connection event for incoming sockets
// and write to console
io.on('connection', function(socket){
    socket.on('test', function(msg) {
        console.log(msg);
        io.sockets.emit('test', msg);
    });
    socket.on('suggestion', function(msg) {
        add_suggestion(msg)
    });
    socket.on('upvote', function(msg) {
        upvote(msg);
    })
    socket.on('downvote', function(msg) {
        downvote(msg);
    })
    socket.on('load', function(msg) {
        send_suggestions();
    })
});

//Listen on specified port for connections
http.listen(port, function(){

  console.log('listening on *:' + port);
});


function add_suggestion(msg) {
    suggestions.suggestions.push({
        suggestion: msg,
        votes: 1
    });
    save_suggestions();

}

function upvote(msg) {
    var len = suggestions.suggestions.length;
    for(i = 0; i < len; i ++) {
        if(suggestions.suggestions[i].suggestion == msg) {
            suggestions.suggestions[i].votes = suggestions.suggestions[i].votes + 1;
            save_suggestions();
            return;
        }
    }
}

function downvote(msg) {
    var len = suggestions.suggestions.length;
    for(i = 0; i < len; i ++) {
        if(suggestions.suggestions[i].suggestion == msg) {
            suggestions.suggestions[i].votes = suggestions.suggestions[i].votes - 1;
            if(suggestions.suggestions[i].votes <= 0) {
                suggestions.suggestions.splice(i, 1);
            }
            save_suggestions();
            return;
        }
    }
}

function load_suggestions() {
    fs.readFile(db, 'utf-8', function(err, data) {
        if(err) throw err;
        suggestions = JSON.parse(data);
    });
}

function save_suggestions() {
    send_suggestions();
    fs.writeFile(db, JSON.stringify(suggestions), 'utf-8', function(err) {
        if (err) throw err;
    })
}

function clear() {
    suggestions.suggestions = [];
    save_suggestions();
}

function send_suggestions() {
    io.sockets.emit('suggestions', suggestions);
}