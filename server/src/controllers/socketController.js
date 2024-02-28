const socketController = (io, socket) => {
  console.log(`New connection, socket id: {${socket.id}}`);

  socket.on("setup", (userId) => {
    // Join socket room based on user ID
    socket.join(userId);
    console.log(`User joined socket, user id: {${userId}}`,);
  });

  socket.on("joinChat", (chatId) => {
    // Join socket room for the specified chat room
    socket.join(chatId);
    console.log(`User joined chat room, chat id: {${chatId}}`,);
  });

  socket.on("sendMessage", (message) => {
    socket.to(message.chat).emit("receiveMessage", message);
  });

  socket.on("deleteMessage", (message) => {
    socket.to(message.chat).emit("deleteMessage", message);
  });

  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("stopTyping", chatId);
  });

  socket.on('checkUserConnected', (userId) => {
    const socketsInRoom = io.of("/").adapter.rooms.get(userId);
    const isConnected = socketsInRoom ? socketsInRoom.size > 0 : false;
    socket.emit('checkUserConnected', { userId, isConnected });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected, socket id: {${socket.id}}`);
  });
}

module.exports = socketController;
