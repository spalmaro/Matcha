// const mongodb = require('mongodb').MongoClient;
const assert = require('assert');

// const url = 'mongodb://localhost:27017/Matcha_DB';
const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`

const pool = new Pool({
    connectionString: connectionString,
})

const addUser = (item, res) => {
    const insertUser = {
        text: 'INSERT INTO users(email) VALUES($1)',
        values: [item.email],
    }

    const checkUserExists = {
        text: 'SELECT * FROM users WHERE username = $1 OR email = $2',
        values: [item.username, item.email]
    }

    pool.query(checkUserExists)
    .then(result => {
        console.log("yep");
        if (result.rowCount == 1) {
            res.json({success: false, msg: 'Email or username already exists'})
        } else {
            pool.query(insertUser)
            .then(resu => {
                console.log('response -->', resu)
                if (resu.rowsCount == 1) {
                    res.json({success: true, msg: 'User was successfully created. You can now log in.'})
                } else {
                    res.json({success: false, msg: 'An error has occurred. Please try again'})
                }
            })
            .catch(e => console.error("user", e.stack))
        }
        // console.log("here", result)
    })
    .catch(e => console.error("nope", e.stack))
    // mongodb.connect(url, (err, db) => {
    //     assert.equal(null, err)
    //     db.collection('users').findOne({$or: [{'username' : item.username}, {'email': item.email}]}, (err, result) => {
    //         if (err) {
    //             console.log(err)
    //             res.json({
    //               success: false,
    //               msg: err
    //             });
    //         }
    //         if (result){
    //             res.json({success: false, msg: 'Email or username already exists'})
    //         } else {
    //             db.collection('users').insertOne(item, (err, result) => {
    //                 assert.equal(null, err)
    //                 console.log('User Inserted')
    //                 res.json({success: true, msg: 'User was successfully created. You can now log in.'})
    //                 db.close()
    //             })
    //         }
        // })
    // })
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
                if (result) {
                    db.collection('views').find({'currentUser': username}).toArray((err, status) => {
                        let array = []
                        let dis = []
                        for (const iliked of status) {
                            if (iliked.status === 'like')
                                array.push(iliked.subject)
                            else if (iliked.status === 'dislike')
                                dis.push(iliked.subject);
                        }
                        result['liked'] = array;
                        result['dislike'] = dis;
                        socket.emit('userInfo:sent', { success: true, user: result })
                        console.log(result.liked);
                    })
                }
                else {
                    socket.emit('userInfo:sent', { success: false, error: 'An error has occurred' })
                }
            }
        })
    })
}

const reportUser = (data) => {
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

const blockUser = (data) => {
        mongodb.connect(url, (err, db) => {
        if (err) {
            throw err;
        }
        db.collection('users').update({'username': data.currentUser}, {$push: {blocked: data.blockedUser}}, (err, result) => {
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
    'reportUser': reportUser,
    'blockUser': blockUser
};
