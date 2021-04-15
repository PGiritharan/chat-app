const http = require('http');
const app = require('./app');
const socketio = require('socket.io');

const server = http.createServer(app);

const io = socketio(server);
io.on('connection',()=>{
    console.log('New web socket connection');
})

module.exports = server;
