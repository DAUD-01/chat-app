require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');       // Node HTTP server
const { Server } = require('socket.io'); // Socket.io
const mongoose = require('mongoose'); // connecting mongoose

const app = express();
const PORT = 3000;

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server);

// // Listen for clients connecting
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Listen for chat messages from this client
//     socket.on('chatMessage', (msg) => {
//         // Broadcast message to all clients
//         io.emit('message', msg);
//     });

//     // Listen for disconnect
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });

const Message = require('./models/Message');

// Hardcoded users (username: password)
const users = {
    "dawood": "pass1",
    "rayyan": "pass2",
    "liyyana": "pass3"
};

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        res.send({ success: true, username }); // send back username
    } else {
        res.send({ success: false, message: 'Invalid username or password' });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');

        // Start server only after DB is connected
        server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

        io.on('connection', (socket) => {
            console.log('A user connected');

            // Load last 50 messages
            Message.find().sort({ timestamp: 1 }).limit(50).then(messages => {
                socket.emit('messageHistory', messages);
            });

            socket.on('chatMessage', async (msg) => {
                const message = new Message(msg);
                await message.save();
                io.emit('message', msg);
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });

    })
    .catch(err => console.log(err));

