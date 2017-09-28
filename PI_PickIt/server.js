//*** PickIt Server ***//

//server definitions:
var express = require("express");
var server  = express();

//read files definitions:
var fs = require('fs');
var id3 = require('id3js');
const songsFolder = './songs/';
var player = require('play-sound')({player: "./mplayer-svn-37955/mplayer"});
var mp3Duration = require('mp3-duration');

//socket io
var io = require('socket.io').listen(1994).sockets;

//parameters
var songsArray = [];
var songID = 0;
var clients = [];
var songsDurations = [];
var currentSong;
var placeName;
var usersPickIt = {};

//Common functions:
function sortSongArray() {
    songsArray.sort(function (songA, songB) {
        if( parseInt(songA.pickIts) > parseInt(songB.pickIts)){
        return -1;
        }

        else {
            return 1 ;
        }
    });
}

function clearSongFromUsersPickIts(songId) {
    for(var attribute in usersPickIt) {
        usersPickIt[attribute].delete(songId);
    }
}

function updateArray(startIndex) {
    for (i = startIndex; i > 0; i--) {
        if (parseInt(songsArray[i].pickIts) > parseInt(songsArray[i - 1].pickIts)){
            var temp = songsArray[i];
            songsArray[i] = songsArray[i - 1];
            songsArray[i - 1] = temp;
        }
    }
}

function getSongById(songID) {
    var songToReturn;
    for(i = 0; i < songsArray.length; i++) {
        if(parseInt(songsArray[i].songID) == songID) {
            songToReturn = songsArray[i];
        }
    }
    return songToReturn;
}

function getIndexById(songID) {
    var indexToReturn;
    for(i = 0; i < songsArray.length; i++) {
        if(parseInt(songsArray[i].songID) == songID) {
            indexToReturn = i;
        }
    }
    return indexToReturn;
}

function emitAllClients(message, action ,params) {
    if(message != null && clients.length > 0 ) {
        var jsonObjectToEmit = {};
        jsonObjectToEmit["action"] = action;
        jsonObjectToEmit["songId"] = params[0];
        jsonObjectToEmit["songData"] = params[1];
        for(i = 0; i < clients.length; i++ ) {
            clients[i].emit(message,jsonObjectToEmit);
        }
    }
}

function writeImageToFile(file, data) {
    return fs.writeFile(file, data,'base64', function (error) {
        if(error != null) {console.log(error);}
    });
}

function getDurationBySongName(songName) {
    for (i = 0; i < songsDurations.length ; i++) {

        if(songName === songsDurations[i]["songName"]) {
            return parseInt(songsDurations[i]["duration"]);
        }
    }
}

function playSongs() {
    if(currentSong != null) {
        songsArray.push(currentSong);
        emitAllClients("true",0,[currentSong.songID,currentSong]);
        clearSongFromUsersPickIts(currentSong.songID);
    }

    currentSong = songsArray[0];
    var currentSongIndex = songsArray.indexOf(currentSong);
    songsArray.splice(currentSongIndex,currentSongIndex + 1);

    var path =  __dirname + songsFolder + currentSong["songName"];
    currentSong["pickIts"] = "0";
    var songDuration = getDurationBySongName(currentSong["songName"]) * 1000 + 1000;

    console.log("Now Playing : " + path + " songId: " + currentSong.songID );
    player.play(path,{maxBuffer: 1024 * 200000000000}, function(err){
        if (err) throw err
    });

    setTimeout(playSongs, songDuration)
}

if(songsArray.length == 0) {
    fs.readdir(songsFolder, function (err, files) {
        files.forEach(function( file) {
            id3({ file: songsFolder + file, type: id3.OPEN_LOCAL }, function(err, tags) {

                mp3Duration(songsFolder + file , function (err, duration) {
                    if (err) return console.log(err.message);
                    console.log('Your file is ' + file + "time:" + duration + ' seconds long');
                    var songsDurationJson = {};
                    songsDurationJson["songName"] = file;
                    songsDurationJson["duration"] = duration;
                    songsDurations.push(songsDurationJson);
                });

                var songsJson = {};

                songID ++;
                songsJson["songName"] = file;
                songsJson["artist"] = tags["artist"];
                songsJson["pickIts"] =  "0";
                songsJson["songID"] = songID.toString();

                songsArray.push(songsJson);
            });
        });
    })
}

fs.readFile('./placeInfo.txt', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    console.log("placeName is:" + data);
    placeName = data;
});

setTimeout(playSongs, 20000);


//Server Services:
io.on('connection', function(socket){
    clients.push(socket);
});

server.get("/getAllSongs",function(request,response) {
    var songJson = {};
    songJson["songs"] = songsArray;
    response.send(songJson);
});

server.get("/getPlaceName", function (request, response) {
    var placeNameJson = {};
    placeNameJson["placeName"] = placeName;
    response.send(placeNameJson);
});

server.get("/sendSongSuggest",function (request, response) {
    let songName = request.query.songName;
    let artist = request.query.artist;
    let youtubeLink = request.query.youtubeLink;

    fs.readFile('./suggestions.txt', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        }
        let currentfileData = data;

        var suggestionToWright;
        if(currentfileData != null) {
            suggestionToWright = currentfileData + "\r\n\r\n songName: " + songName + "\r\n artist: " + artist + "\r\n youtube link: " + youtubeLink;
        }
        else {
            suggestionToWright = " songName: " + songName + "\r\n artist: " + artist + "\t\n youtube link: " + youtubeLink;
        }

        fs.writeFile("./suggestions.txt", suggestionToWright, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    });
    response.send({status: true});
});

server.get("/getCurrentPlayingSong",function (request, response) {
    var messageToSend = [];
    var songJson = {};
    messageToSend.push(currentSong);
    songJson["songs"] = messageToSend;
    response.send(songJson);
});

server.get("/searchSong",function (request, response) {
    var songName = request.query.songName.toLowerCase();
    var searchResolt = [];

    for(i = 0; i < songsArray.length; i++) {
        var currentSongName = songsArray[i].songName.toLowerCase();

        if(currentSongName.includes(songName)) {
            searchResolt.push(songsArray[i]);
        }
    }

    response.send(searchResolt);
});

server.get("/updatePickIt",function (request, response) {
    var songID = request.query.id;
    var userId = request.query.userId;
    var userIdPickItUntilNow =  usersPickIt[userId];

    if(userIdPickItUntilNow == null) {
        userIdPickItUntilNow = new Set();
    }

    if(!userIdPickItUntilNow.has(songID)) {
        var songToUpdate = getSongById(songID);
        var songToUpdateIndex = getIndexById(songID);
        var pickIts = parseInt(songToUpdate.pickIts);
        songToUpdate.pickIts = JSON.stringify(pickIts += 1);
        updateArray(songToUpdateIndex);
        emitAllClients("true",1,[songToUpdate.songID,songToUpdate]);
        response.send({status: "true"});
        userIdPickItUntilNow.add(songID);
        usersPickIt[userId] = userIdPickItUntilNow;
    }

    else {
        response.send({status: "false"})
    }

});

server.get("/getUserPickits",function (request,response) {
    let userId = request.query.userId;
    var arrayOfPickits = [];
    if(usersPickIt[userId] != null) {
        usersPickIt[userId].forEach(v => arrayOfPickits.push(v));
        let jsonToSend = {};
        jsonToSend["userPickits"] = arrayOfPickits;
        response.send(jsonToSend)
    }
    else {
        response.send({error: "false"});
    }
});

server.get("/2",function (request, response) {
    setTimeout(function(){
        var songsToSend =[];

        for(i = 0; i < 6; i++) {
            var song = songsArray[i];
            if(song != null){
                songsToSend.push(song);
            }
        }
        response.send(songsToSend);

    },100);
});

server.listen(1995);
console.log("Port 1995");