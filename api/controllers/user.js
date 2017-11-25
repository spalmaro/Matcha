const mongodb = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/Matcha_DB';


const addUser = (item, res) => {
    mongodb.connect(url, (err, db) => {
        assert.equal(null, err)
        db.collection('users').findOne({$or: [{'login' : item.login}, {'email': item.email}]}, (err, result) => {
            if (err) {
                console.log(err)
                res.json({
                  success: false,
                  msg: err
                });
            }
            if (result){
                res.json({success: false, msg: 'Email or username already exists'})
            } else {
                db.collection('users').insertOne(item, (err, result) => {
                    assert.equal(null, err)
                    console.log('User Inserted')
                    res.json({success: true, msg: 'User was successfully created. You can now log in.'})
                    db.close()
                })
            }
        })
    })
}

const updateUser = (item, login) => {
    mongodb.connect(url, (err, db) => {
        assert.equal(null, err)
        db.collection('users').update({ 'login': login }, { $set: item }, (err, result) => {
            assert.equal(null, err)
            console.log('User Updated')
            db.close()
        })
    })
}

const getUserInfo = (username, socket) => {
    mongodb.connect(url, (err, db) => {
        if (err) {
            socket.emit({success: false, error: err})
        }
        db.collection('users').findOne({'login': username}, (err, result) => {
            if (err) {
              socket.emit('userInfo:sent', { success: false, error: err });
            } else {
                socket.emit('userInfo:sent', { success: true, user: result })
            }
        })
    })
}

module.exports = {
    'addUser': addUser,
    'updateUser': updateUser,
    'getUserInfo': getUserInfo
};
