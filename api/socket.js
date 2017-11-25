const server = require('./bin/www')
const io = require('socket.io')(server)
const socketioJwt = require('socketio-jwt')
const env = require('./config/environment')
const userCtrl = require('./controllers/user')

// io.on('connection', socketioJwt.authorize({
//     secret: env.secret,
//     timeout: 15000 // 15 seconds to send the authentication message
// })).on('authenticated', (socket) => {
//     socket.on('userInfo:get', (username) => {
//         userCtrl.getUserInfo(username, socket);
//     })
// })