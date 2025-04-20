const jwt = require('jsonwebtoken');
const config = require('config');
const handleClassroomEvents = require('./classroomHandler');
console.log('file is rendering ')
module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, config.get('jwtSecret'));
      socket.user = decoded.user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    handleClassroomEvents(io, socket);
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};