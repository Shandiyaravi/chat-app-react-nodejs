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


const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_API_URL,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.error(err.message));

app.get("/ping", (_req, res) => res.json({ msg: "Ping Successful" }));
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);



global.onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    console.log(`User ${userId} connected`);
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", async (data) => {
    try {
      const sender = await User.findById(data.from);
      const receiver = await User.findById(data.to);

      if (
        sender.blockedUsers.includes(data.to) ||
        receiver.blockedUsers.includes(data.from)
      ) {
        return;
      }

      const sendUserSocket = onlineUsers.get(data.to);
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
  });
});

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build", "index.html"))
);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
