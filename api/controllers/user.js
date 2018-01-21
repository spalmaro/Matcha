const mongodb = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/Matcha_DB';


const addUser = (item, res) => {
    mongodb.connect(url, (err, db) => {
        assert.equal(null, err)
        db.collection('users').findOne({$or: [{'username' : item.username}, {'email': item.email}]}, (err, result) => {
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

const updateUser = (item, socket) => {
    console.log('updating...')
    delete item._id;
    mongodb.connect(url, (err, db) => {
        if (err) {
          socket.emit({ success: false, error: err });
          return ;
        }
        db.collection('users').update({ 'username': item.username }, { $set: item }, (err, result) => {
            if (err) {
              socket.emit('updateProfile:done', { success: false, error: err });
              return ;
            } 
            if (result) {
                socket.emit('updateProfile:done', { success: true, message: "Your profile has successfully been updated" });
                console.log(item.username + "s profile has been updated")
            } else {
                socket.emit('updateProfile:done', { success: false, error: err });
            }
            db.close()
        })
    })
}

const getUserInfo = (username, socket) => {
    mongodb.connect(url, (err, db) => {
        if (err) {
            socket.emit({success: false, error: err})
            return ;
        }
        db.collection('users').findOne({'username': username}, (err, result) => {
            if (err) {
              socket.emit('userInfo:sent', { success: false, error: err });
            } else {
                if (result)
                    socket.emit('userInfo:sent', { success: true, user: result })
                else {
                    socket.emit('userInfo:sent', { success: false, error: 'An error has occurred' })
                }
            }
        })
    })
}

const reportUser = (data, socket) => {
    mongodb.connect(url, (err, db) => {
        if (err) {
            throw err;
        }
        db.collection('users').update({'username': data.userToReport}, {$push: {reportedBy: data.currentUser}}, (err, result) => {
            if (err) {
              throw err;
            } 
        })
    })
}

module.exports = {
    'addUser': addUser,
    'updateUser': updateUser,
    'getUserInfo': getUserInfo,
    'reportUser': reportUser
};
