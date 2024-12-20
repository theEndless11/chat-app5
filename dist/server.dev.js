"use strict";

var express = require('express');

var http = require('http');

var socketIo = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIo(server);
app.use(express["static"]('public')); // Serve static files from 'public' directory
// Store users and messages (in-memory for simplicity)

var users = {}; // Format: { username: socketId }

var messages = []; // List of all public messages
// When a client connects

io.on('connection', function (socket) {
  console.log('A user connected'); // Handle user registration

  socket.on('register_user', function (data) {
    var username = data.username;

    if (users[username]) {
      socket.emit('registration_error', {
        message: 'Username already taken'
      });
    } else {
      users[username] = socket.id; // Assign the socket ID to the username

      io.emit('user_list', Object.keys(users)); // Send updated user list to all clients

      socket.emit('user_status', {
        username: username,
        status: 'online'
      }); // Notify the user that they're online

      socket.broadcast.emit('user_status', {
        username: username,
        status: 'online'
      }); // Notify others

      io.emit('user_joined', {
        username: username
      }); // Notify all users about new join
    }
  }); // Handle public messages

  socket.on('send_message', function (data) {
    var username = data.username,
        message = data.message;
    var timestamp = new Date().toLocaleTimeString();
    var newMessage = {
      username: username,
      message: message,
      timestamp: timestamp,
      isPrivate: false
    };
    messages.push(newMessage);
    io.emit('new_message', newMessage); // Broadcast the message to all clients
  }); // Handle private messages

  socket.on('send_private_message', function (data) {
    var sender = data.sender,
        receiver = data.receiver,
        message = data.message;
    var timestamp = new Date().toLocaleTimeString();
    var newMessage = {
      username: sender,
      message: message,
      timestamp: timestamp,
      isPrivate: true
    };
    messages.push(newMessage);

    if (users[receiver]) {
      io.to(users[receiver]).emit('new_private_message', newMessage); // Send the message to the specific user
    }
  }); // When a user disconnects

  socket.on('disconnect', function () {
    for (var username in users) {
      if (users[username] === socket.id) {
        delete users[username]; // Remove user from the list

        io.emit('user_list', Object.keys(users)); // Update the user list

        socket.broadcast.emit('user_status', {
          username: username,
          status: 'offline'
        }); // Notify others

        break;
      }
    }

    console.log('A user disconnected');
  });
}); // Start the server

server.listen(3000, function () {
  console.log('Server is running on http://localhost:3000');
});
//# sourceMappingURL=server.dev.js.map
