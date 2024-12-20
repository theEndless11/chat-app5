// Initialize Socket.IO client
const socket = io('https://chat-4aad6bbyg-snehas-projects-dbda7901.vercel.app/');

// Store user data and messages
let username = '';
let users = [];
let messages = [];

// Register the user
function registerUser() {
    username = document.getElementById('username').value.trim();
    if (username === '') {
        alert('Please enter a valid username.');
        return;
    }

    // Send registration request to the backend
    socket.emit('register_user', { username });

    // Show chat section
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('chat-section').style.display = 'block';
}

// Send a public message
function sendMessage() {
    const message = document.getElementById('message').value.trim();
    if (message !== '') {
        const timestamp = new Date().toLocaleTimeString();
        socket.emit('send_message', { username, message });
        addMessage(username, message, timestamp);
    }
    document.getElementById('message').value = '';
}

// Send a private message
function sendPrivateMessage() {
    const recipient = document.getElementById('privateUserList').value;
    const message = document.getElementById('privateMessage').value.trim();
    if (message !== '' && recipient !== '') {
        socket.emit('send_private_message', { sender: username, receiver: recipient, message });
        addMessage(username, `(Private) ${message}`, new Date().toLocaleTimeString());
    }
    document.getElementById('privateMessage').value = '';
}

// Add message to the chat
function addMessage(user, message, timestamp) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${user}</strong>: ${message} <span>(${timestamp})</span>`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Update user list
socket.on('user_list', (data) => {
    users = data;
    const userList = document.getElementById('userList');
    const privateUserList = document.getElementById('privateUserList');
    
    // Update user list for public chat
    userList.innerHTML = '';
    data.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });

    // Update user list for private chat
    privateUserList.innerHTML = '';
    data.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        privateUserList.appendChild(option);
    });
});

// Handle new public message
socket.on('new_message', (data) => {
    addMessage(data.username, data.message, data.timestamp);
});

// Handle new private message
socket.on('new_private_message', (data) => {
    addMessage(data.username, `(Private) ${data.message}`, data.timestamp);
});

// Handle user join notifications
socket.on('user_joined', (data) => {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = `${data.username} has joined the chat.`;
    document.getElementById('chatbox').appendChild(notification);
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
});

// Handle user status change (online/offline)
socket.on('user_status', (data) => {
    if (data.status === 'offline') {
        alert(`${data.username} has gone offline`);
    }
});

// Handle Enter key for sending messages
function checkEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

