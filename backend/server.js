const app = require('./app');
const http = require('http');
const socketSetup = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

socketSetup(io);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));