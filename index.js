const express = require('express');
const bodyParser = require('body-parser');

const app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server, { serveClient: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

var ws = require('./socket/socket.js')(io);

server.listen('8080', () => {
    console.log('Server started on port 8080');
});


