const User = require('../models/user.model')

module.exports = (io, socket) => {
    const createOrder = (payload) => {
        User.findByIdAndUpdate(socket.decoded._id, {
            $set: {
                location: {
                    "type": "Point",
                    "coordinates": [
                        payload.longitude,
                        payload.latitude
                    ]
                }
            }
        }).then((user => {
            io.sockets.emit('order:create', payload)
        })).catch((err) => {
            console.log(err)
        })
    }

    const getAllNeareUsers = async (payload) => {
        console.log(new Date(new Date().getTime() - 1000 * 60 * 5), 'mtav', socket.decoded.location.coordinates)

        User.find({
            $and: [
                { _id: { $ne: socket.decoded._id } },
                {
                    location: {
                        $nearSphere: {
                            $geometry: {
                                type: 'Point',
                                coordinates: socket.decoded.location.coordinates
                            },
                            $maxDistance: 1000
                        }
                    }
                },
                {
                    updatedAt: { // 18 minutes ago (from now)
                        $gt: new Date(new Date().getTime() - 1000 * 60 * 0.1)
                    }
                }
            ]
        }).then((user) => {
            if(user.length > 0){
                console.log(user,'-----------------')

                socket.emit('user:read', user)

            }
        })
        // ...
    }
    // use(function (socket, next) {
    //     console.log('mtav')
    //     if (socket.handshake.query && socket.handshake.query.token) {
    //         jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function (err, decoded) {
    //             if (err) return next(new Error('Authentication error'));
    //             socket.decoded = decoded;
    //             next();
    //         });
    //     }
    //     else {
    //         console.log('errrp')
    //         next(new Error('Authentication error'));
    //     }
    // })
    socket.on("order:create", createOrder);
    socket.on("user:read", getAllNeareUsers);
}
// {
//     "longitude": -72.7738706,
//         "latitude": 41.6332836
// }

