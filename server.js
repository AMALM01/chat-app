// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('🔌 New user connected:', socket.id);

  socket.on('join-room', ({ room, username, color, roomName }) => {
    socket.join(room);
    socket.data.username = username;
    socket.data.color = color;
    socket.data.roomName = roomName;

    console.log(`${username} joined room ${room} (${roomName})`);

    socket.to(room).emit('chat-message', {
      username: 'System',
      color: '#555',
      message: `${username} joined the room`,
    });
  });

  socket.on('chat-message', ({ room, username, color, message }) => {
    io.to(room).emit('chat-message', { username, color, message });

    // Auto-delete message after 30s
    setTimeout(() => {
      io.to(room).emit('delete-message', message);
    }, 30000);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,  () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
