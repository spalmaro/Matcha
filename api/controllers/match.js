const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/Matcha_DB';
const scoreCtrl = require('./score');

module.exports = {

    setLikeDislike(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(err);
                socket.emit('status:post', { success: false, error: err });
                return;
            }
            db.collection('views').insert({
                currentUser: data.currentUser,
                subject: data.username,
                status: data.status
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    socket.emit('status:post', { success: false, error: err });
                    return;
                }
            });
            if (data.status === 'like') {
                checkMatch(data, socket);
                scoreCtrl.addScore(data);
                db.collection('notifications').insert({'type': 'like', 'who': data.username, 'from': data.currentUser, 'read': false, 'date': new Date().getTime()}, (err, result) => {
                    if (err)
                        throw err;
                })
            } else {
                scoreCtrl.subtractScore(data);
                db.collection('notifications'.insert({'type': 'dislike', 'who': data.username, 'from': data.currentUser, 'read': false, 'date': new Date().getTime()}, (err, result) => {
                    if (err) throw err;
                }))
            }
        })
    },

    checkMatch(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(err);
                socket.emit('match:post', { success: false, error: err });
                return;
            }
            db.collection('views').findOne({
                currentUser: data.username,
                subject: data.currentUser,
                status: 'like'
            }, (err, result) => {
                if (result) {
                    db.collection('match').insert({
                        users: [data.username, data.currentUser],
                        timestamp: new Date().getTime(),
                        messages: [],
                        read: true
                    }, (err, result) => {
                        if (err) throw err;
                        socket.emit('match:post', {success: true})
                    })
                    let date = new Date().getTime();
                    db.collection('notifications').insert([{'type': 'match', 'who': data.username, 'from': data.currentUser, 'read': false, 'date': date},
                    {'type': 'match', 'who': data.currentUser, 'from': data.username, 'read': false, 'date': date}], (err, result) => {
                        if (err) throw err;
                })
                }
            })
        })
    }
}