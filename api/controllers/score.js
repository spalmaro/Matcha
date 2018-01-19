const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/Matcha_DB';

module.exports = {

    addScore(data) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(err);
                return;
            }
            db.collection('users').update({'username': data.username}, {$set: {$inc : { score: 1}}}, (err, result) => {
                if (err) {
                    console.log(err);
                    return ;
                }

            })
        })
    },

    subtractScore(data) {
    mongodb.connect(url, (err, db) => {
        if (err) {
            console.log(err);
            return;
        }
        db.collection('users').update({'username': data.username}, {$set: {$inc : { score: -1}}}, (err, result) => {
            if (err) {
                console.log(err);
                return ;
            }

        })
    })
    }
}