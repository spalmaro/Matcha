// const io = require('socket.io')(server)
module.exports = (io) => {
    const socketioJwt = require('socketio-jwt')
    const env = require('./config/environment')
    const userCtrl = require('./controllers/user')
    const searchCtrl = require('./controllers/search')
    const matchCtrl= require('./controllers/match')
    const notificationCtrl= require('./controllers/notification')

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
            console.log('getting list of users to match')
            searchCtrl.getList(user, socket);
        })

        socket.on('status:set', (data) => {
            matchCtrl.setLikeDislike(data, socket);
        })

        socket.on('search:get', (data) => {
            searchCtrl.search(data, socket);
        });

        socket.on('notifications:get', (data) => {
            console.log('getting notifications')
            notificationCtrl.getNotifications(data, socket);
        })

        socket.on('notifications:set', data => {
            console.log('mark notifications as read');
            notificationCtrl.readNotifications(data)
        })

        socket.on('profile:get', username => {
            console.log('searching for user');
            searchCtrl.getProfile(username, socket);
        })

    })
}