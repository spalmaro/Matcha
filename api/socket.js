// const io = require('socket.io')(server)
module.exports = (io) => {
    const socketioJwt = require('socketio-jwt')
    const env = require('./config/environment')
    const userCtrl = require('./controllers/user')
    const searchCtrl = require('./controllers/search')

    io.on('connection', socketioJwt.authorize({
        secret: env.secret,
        timeout: 15000 // 15 seconds to send the authentication message
    })).on('authenticated', (socket) => {

        socket.on('userInfo:get', (username) => {
            userCtrl.getUserInfo(username, socket);
        })

        socket.on('updateProfile:set', (user) => {
            userCtrl.updateUser(user, socket);
        })

        socket.on('list:get', (user) => {
            searchCtrl.getList(user, socket);
        })
    })
}