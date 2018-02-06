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
            db.collection('notifications').find({'who': data.username, 'from': {$nin: data.blocked}}).sort({'date': -1}).toArray((err, result) => {
                if (err) throw err;
                if (result)
                    socket.emit('notifications:post', result);
            })
        })
    },

    readNotifications(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) throw err;
            console.log('alkdjf', data);
            db.collection('notifications').update({'who': data}, {$set: {'read': true}}, {multi:true}, (err, result) => {
                if (err) throw err;
                // console.log('RESULT READ UNREAD NOTIF', result);
            })
        })
    },

    sendMessage(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) throw err;
            console.log('lakdjflaksjdf', data)
            db.collection('match').findOne({users: {$all: [data.to, data.from]}}, (err, result) => {
                if (err) throw err;
                if (result) {
                    let message = {};
                    messsage['to'] = data.to;
                    message['from'] = data.from;
                    message['message'] = data.message;
                    message['timestamp'] = data.timestamp;
                    let msg = result.messages.push(message);
                    db.collection('match').update({'users': {$all: [data.to, data.from]}}, {$set:  {'messages': msg, 'read': false}}, (err, result) => {
                        if (err) throw err;
                    })
                }
            })
        })
    },

    getMessages(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                throw err;
            }
            db.collection('match').find({'users': data.username}).sort({'timestamp': -1, 'messages.timestamp': -1}).toArray((err, result) => {
                if (err) throw err;
                socket.emit('messages:post', result);
            })
        })
    },

    getLikedBy(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                throw err;
            }
            db.collection('views').find({'currentUser': data, 'status': 'like'}).toArray((err, result) => {
                if (err) throw err;

                socket.emit('likeby:post', result);
            })
        })
    },

    getViewedBy(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                throw err;
            }
            db.collection('visit').find({'subject': data}).toArray((err, result) => {
                if (err) throw err;

                socket.emit('viewdby:post', result);
            })
        })
    }


}