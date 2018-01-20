const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/Matcha_DB';
const moment = require('moment')

module.exports = {

    setVisit(data) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(err);
                return;
            }
            db.collection('visit').findOne({'subject': data.username, 'from': data.currentUser}, (err, result) => {
                if (result) {
                    return ;
                } else {
                    db.collection('visit').insert({'subject' : data.username, 'from': data.currentUser }, (err, result) => {
                        if (err) throw err;

                        db.collection('notifications').insert({'type': 'visit', 'who': data.username, 'from': data.currentUser, 'read': false, 'date': new Date().getTime()}, (err, result) => {
                        if (err) throw err
                        })
                    })
                }
            })
        })
    },

    getNotifications(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(error);
                return ;
            }
            db.collection('notifications').find({'who': data.username, 'from': {$nin: data.blocked}}).sort({'date': -1}, (err, result) => {
                if (err) throw err;

                socket.emit('notifications:post', result);
            })
        })
    },

    readUnreadNotifications(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) throw err;
            db.collection('notifications').update({'_id': data._id}, {'read': data.read ? false: true}, (err, result) => {
                if (err) throw err;
                console.log('RESULT READ UNREAD NOTIF', result);
            })
        })
    },

    sendMessage(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) throw err;
            db.collection('match').findOne({users: {$all: [data.to, data.from]}}, (err, result) => {
                if (err) throw err;
                if (result) {
                    let msg = result.messages.push(data.message);
                    db.collection('match').update({'users': {$all: [data.to, data.from]}}, {$set:  {'messages': msg, 'read': false}}, (err, result) => {
                        if (err) throw err;
                    })
                }
            })
        })
    },

    getMessages(data, socket) {
        mongodb.connect(url, (err, result) => {
            if (err) {
                throw err;
            }
            db.collection('match').find({'users': {$in: data.username}, 'messages.from': {$nin: data.blocked}}).sort({'timestamp': -1}, (err, result) => {
                if (err) throw err;
                socket.emit('messages:post', result);
            })
        })
    }
}