require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http"); // Node HTTP server
const { Server } = require("socket.io"); // Socket.io
const mongoose = require("mongoose"); // connecting mongoose

const app = express();
const PORT = process.env.PORT || 3000;

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server);

const Message = require("./models/Message");

// Hardcoded users (username: password)
const users = {
  Daud: "mango",
  Echo: "apple",
  Pixel: "banana",
  Nova: "grapes",
};

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    res.send({ success: true, username }); // send back username
  } else {
    res.send({ success: false, message: "Invalid username or password" });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Start server only after DB is connected
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );

    io.on("connection", (socket) => {
      console.log("A user connected");

      // Load last 50 messages
      socket.on("requestHistory", async () => {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);

        messages.reverse();
        socket.emit("messageHistory", messages);
      });

      socket.on("chatMessage", async (msg) => {
        try {
          const message = new Message({
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp || new Date(), // Fixed: lowercase 'timestamp' to match schema
          });

          await message.save();

          // Fixed: Use broadcast so the sender (who rendered optimistically) doesn't get a duplicate
          socket.broadcast.emit("message", msg);

          // Fixed: Send confirmation back to sender with correct ID casing
          socket.emit("messageAccepted", {
            tempID: msg.tempID,
          });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });

      socket.on("clearAllMessages", async () => {
        try {
          await Message.deleteMany({});
          console.log("Database successfully cleared.");

          io.emit("chatCleared");
        } catch (err) {
          console.error("Error clearing database:", err);
        }
      });
    });
  })
  .catch((err) => console.log(err));
