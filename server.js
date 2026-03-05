const express = require('express');
const path = require('path');
const http = require('http');       // Node HTTP server
const { Server } = require('socket.io'); // Socket.io

const app = express();
const PORT = 3000;

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Listen for clients connecting
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for chat messages from this client
    socket.on('chatMessage', (msg) => {
        // Broadcast message to all clients
        io.emit('message', msg);
    });

    // Listen for disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));