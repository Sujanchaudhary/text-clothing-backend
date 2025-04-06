const socketIo = require("socket.io");
let io;

const setupSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Update this to match your frontend URL
      methods: ["GET", "POST"],
    },
  });
  // Listen for socket connection events
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Listen for users joining a notification room
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(
        `User ${socket.id} joined notifications room for user: ${userId}`
      );
    });

    // Listen for disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

// Function to emit a notification to a specific user
const emitNotification = (userId, notificationData) => {
  if (io) {
    io.to(userId).emit("receiveNotification", notificationData);
  }
};

module.exports = {
  setupSocket,
  emitNotification,
};
