const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
const User = require("./models/userModel");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "https://chat-app-react-nodejs-ymsz.onrender.com", // Correct origin for production
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use((req, res, next) => {
  console.log("CORS Headers:", res.getHeaders());
  next();
});
app.use(cors(corsOptions));
app.use(express.json());

mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "https://chat-app-react-nodejs-ymsz.onrender.com", // Correct origin for production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", async (data) => {
    try {
      // Get the sender and receiver details
      const sender = await User.findById(data.from);
      const receiver = await User.findById(data.to);

      // Check if the sender is blocked by the receiver or vice versa
      if (
        sender.blockedUsers.includes(data.to) ||
        receiver.blockedUsers.includes(data.from)
      ) {
        return; // Do nothing if either user has blocked the other
      }

      // If the receiver is online, send the message
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
});

// Serve static files from the client build directory
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
