const http = require('http');
const app = require('./app');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/messages');
const  { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const server = http.createServer(app);

const io = socketio(server);

io.on('connection',(socket)=>{
    console.log('New web socket connection');
    socket.on('join',(options,ack)=>{
        const { error, user } = addUser({ id:socket.id, ...options });
        if(error){
            return ack(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage({username:'Admin',text:'Welcome!'}));
        socket.broadcast.to(user.room).emit('message',generateMessage({username:'Admin',text:`${user.username} has joined!`}));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        ack();
    })
    socket.on('sendMessage',(messageRecived,ack)=>{
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(messageRecived)){
            return ack('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage({username:user.username,text:messageRecived}));
        ack();
    });
    socket.on('sendLocation',(cords,ack)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateMessage({username:user.username,text:`https://www.google.com/maps?q=${cords.latitude},${cords.longitude}`}));
        ack();
    });
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage({username:'Admin',text:`${user.username} has left!`}));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            });
            
        }
    });
});

module.exports = server;
