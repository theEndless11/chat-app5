"use strict";

// Initialize Socket.IO client
var socket = io('https://chat-4aad6bbyg-snehas-projects-dbda7901.vercel.app/'); // Store user data and messages

var username = '';
var users = [];
var messages = []; // Register the user

function registerUser() {
  username = document.getElementById('username').value.trim();

  if (username === '') {
    alert('Please enter a valid username.');
    return;
  } // Send registration request to the backend


  socket.emit('register_user', {
    username: username
  }); // Show chat section

  document.getElementById('register-section').style.display = 'none';
  document.getElementById('chat-section').style.display = 'block';
} // Send a public message


function sendMessage() {
  var message = document.getElementById('message').value.trim();

  if (message !== '') {
    var timestamp = new Date().toLocaleTimeString();
    socket.emit('send_message', {
      username: username,
      message: message
    });
    addMessage(username, message, timestamp);
  }

  document.getElementById('message').value = '';
} // Send a private message


function sendPrivateMessage() {
  var recipient = document.getElementById('privateUserList').value;
  var message = document.getElementById('privateMessage').value.trim();

  if (message !== '' && recipient !== '') {
    socket.emit('send_private_message', {
      sender: username,
      receiver: recipient,
      message: message
    });
    addMessage(username, "(Private) ".concat(message), new Date().toLocaleTimeString());
  }

  document.getElementById('privateMessage').value = '';
} // Add message to the chat


function addMessage(user, message, timestamp) {
  var chatbox = document.getElementById('chatbox');
  var messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML = "<strong>".concat(user, "</strong>: ").concat(message, " <span>(").concat(timestamp, ")</span>");
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
} // Update user list


socket.on('user_list', function (data) {
  users = data;
  var userList = document.getElementById('userList');
  var privateUserList = document.getElementById('privateUserList'); // Update user list for public chat

  userList.innerHTML = '';
  data.forEach(function (user) {
    var li = document.createElement('li');
    li.textContent = user;
    userList.appendChild(li);
  }); // Update user list for private chat

  privateUserList.innerHTML = '';
  data.forEach(function (user) {
    var option = document.createElement('option');
    option.value = user;
    option.textContent = user;
    privateUserList.appendChild(option);
  });
}); // Handle new public message

socket.on('new_message', function (data) {
  addMessage(data.username, data.message, data.timestamp);
}); // Handle new private message

socket.on('new_private_message', function (data) {
  addMessage(data.username, "(Private) ".concat(data.message), data.timestamp);
}); // Handle user join notifications

socket.on('user_joined', function (data) {
  var notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = "".concat(data.username, " has joined the chat.");
  document.getElementById('chatbox').appendChild(notification);
  document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
}); // Handle user status change (online/offline)

socket.on('user_status', function (data) {
  if (data.status === 'offline') {
    alert("".concat(data.username, " has gone offline"));
  }
}); // Handle Enter key for sending messages

function checkEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}
//# sourceMappingURL=chat.dev.js.map
