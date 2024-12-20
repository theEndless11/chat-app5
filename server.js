const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));  // Serve static files from 'public' directory

// Store users and messages (in-memory for simplicity)
let users = {};  // Format: { username: socketId }
let messages = [];  // List of all public messages

// When a client connects
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user registration
    socket.on('register_user', (data) => {
        const { username } = data;
        if (users[username]) {
            socket.emit('registration_error', { message: 'Username already taken' });
        } else {
            users[username] = socket.id;  // Assign the socket ID to the username
            io.emit('user_list', Object.keys(users));  // Send updated user list to all clients
            socket.emit('user_status', { username, status: 'online' });  // Notify the user that they're online
            socket.broadcast.emit('user_status', { username, status: 'online' });  // Notify others
            io.emit('user_joined', { username });  // Notify all users about new join
        }
    });

    // Handle public messages
    socket.on('send_message', (data) => {
        const { username, message } = data;
        const timestamp = new Date().toLocaleTimeString();
        const newMessage = { username, message, timestamp, isPrivate: false };
        messages.push(newMessage);
        io.emit('new_message', newMessage);  // Broadcast the message to all clients
    });

    // Handle private messages
    socket.on('send_private_message', (data) => {
        const { sender, receiver, message } = data;
        const timestamp = new Date().toLocaleTimeString();
        const newMessage = { username: sender, message, timestamp, isPrivate: true };
        messages.push(newMessage);
        if (users[receiver]) {
            io.to(users[receiver]).emit('new_private_message', newMessage);  // Send the message to the specific user
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        for (let username in users) {
            if (users[username] === socket.id) {
                delete users[username];  // Remove user from the list
                io.emit('user_list', Object.keys(users));  // Update the user list
                socket.broadcast.emit('user_status', { username, status: 'offline' });  // Notify others
                break;
            }
        }
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

