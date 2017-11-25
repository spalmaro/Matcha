var mongodb = require('mongodb').MongoClient;

//connect to db mongodb://localhost/db_name'
var url = 'mongodb://localhost:27017/Matcha_DB';

var connect = () => {
    return new Promise((resolve, reject) => {
        mongodb.connect(url, (err, db) => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        })
    })
}

module.exports = {
    'connect': connect
};