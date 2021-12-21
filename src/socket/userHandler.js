module.exports = (io, socket) => {
    const createUser = (payload) => {
        
        // ...
    }

    const readUser = (orderId, callback) => {
        // ...
    }

    socket.on("user:create", createUser);
    socket.on("user:read", readUser);
}
