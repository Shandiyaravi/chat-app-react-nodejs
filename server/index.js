const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
const User = require("./models/userModel");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
// Test route to verify server is up
app.get("/ping", (_req, res) => res.json({ msg: "Ping Successful" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_API_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// CORS Middleware Configuration
app.use(
  cors({
    origin: process.env.REACT_APP_API_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests
app.options(
  "*",
  cors({
    origin: process.env.REACT_APP_API_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Database connection
mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.error(err.message));



// Handle WebSocket connections
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    console.log(`User ${userId} connected`);
    global.onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", async (data) => {
    try {
      const sender = await User.findById(data.from);
      const receiver = await User.findById(data.to);

      // Check if users are blocked
      if (
        sender.blockedUsers.includes(data.to) ||
        receiver.blockedUsers.includes(data.from)
      ) {
        return;
      }

      const sendUserSocket = global.onlineUsers.get(data.to);
      if (sendUserSocket) {
        console.log("Sending message to:", sendUserSocket);
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    global.onlineUsers.delete(socket.id);
  });
});

// Serve static files from the React client build directory
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build", "index.html"))
);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
