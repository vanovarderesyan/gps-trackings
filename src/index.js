const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const socketio = require('socket.io')
const http = require('http').createServer(app);
let server;
const registerOrderHandlers = require("./socket/orderHandler");
const registerUserHandlers = require("./socket/userHandler");
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = http.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
    const io = socketio(http, {
      cors: {
        methods: ["GET", "POST"]
      }
    });

    const onConnection = (socket) => {
      console.log('conect')
      registerOrderHandlers(io, socket);
      registerUserHandlers(io, socket);
    }
    const jwt = require('jsonwebtoken');

    io.use(function (socket, next) {
      try {
        if (socket.handshake.query && socket.handshake.query.token) {
          console.log(socket.handshake.query.token)
          jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return next(new Error('Authentication error'));
            User.findById(decoded.sub).then((user) => {
              socket.decoded = user;
              next();
            })
          });
        }
        else {

          next(new Error('Authentication error'));
        }
      } catch (error) {
        console.log(error)
      }

    }).on("connection", onConnection)

  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
