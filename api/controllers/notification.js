const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/Matcha_DB';
const moment = require('moment')

module.exports = {

    setVisit(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(err);
                socket.emit('visit:post', { success: false, error: err });
                return;
            }
            db.collection('visit').findOne({'subject': data.username, 'from': data.currentUser}, (err, result) => {
                if (result) {
                    //should it send another notification?
                    db.collection('notifications').insert({'type': 'visit', 'who': data.username, 'from': data.currentUser, 'read': false, 'date': new Date().getTime()}, (err, result) => {
                        if (err) throw err
                    })
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
            db.collection('notifications').find({'username': data.username}).sort({'date': -1}, (err, result) => {
                if (err) throw err;

                socket.emit('notifications:post', result);
            })
        })
    }
}