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
    console.log("ITEM", item);

    const insertUser = {
        text: 'INSERT INTO users(email, username, firstname, lastname, age, dobday, dobmonth, dobyear, password, gender, orientation, description, location, address, profilepicture, score, blocked, reportedby, firstconnection, interests,  picture1, picture2, picture3, picture4) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)',
        values: item
    }
    const checkUserExists = {
        text: 'SELECT (username, email) FROM users WHERE username=$1 OR email=$2',
        values: [item[1], item[0]]
    };

    pool.query(checkUserExists)
    .then(result => {
        if (result.rowCount == 1) {
            res.json({success: false, msg: 'Email or username already exists'})
        } else {
            pool.query(insertUser)
            .then(resu => {
                console.log('response -->', resu)
                if (resu.rowCount == 1) {
                    res.json({success: true, msg: 'User was successfully created. You can now log in.'})
                } else {
                    res.json({success: false, msg: 'An error has occurred. Please try again'})
                }
            })
            .catch(e => console.error("user", e.stack))
        }
    })
    .catch(e => console.error("nope", e.stack))
}

const updateUser = (item, socket) => {

    let mf = Object.values(item);
    mf.splice(13, 1);
    mf.push(`(${item.location.x}, ${item.location.y})`)
    for (let x in mf) {
        console.log( x , mf[x])

    }
    
    const userUpdate = {
        text: "UPDATE users SET email = $2, username = $3, firstname = $4, lastname = $5, age = $6, dobday = $7, dobmonth = $8, dobyear = $9, password = $10, gender = $11, orientation = $12, description = $13, location = $26 ::point, address = $14, lastconnected = $15, profilepicture= $16, score = $17, blocked = ARRAY $18 ::text[], reportedby = ARRAY $19 ::text[], firstconnection = $20, interests = ARRAY $21 ::text[],  picture1 = $22, picture2 = $23, picture3 = $24, picture4 = $25 WHERE user_uuid=$1",
        values: mf
    };

    pool.query(userUpdate).then(result => {
            console.log('cdddhfgghnfhcghnould not update')
            if (result.rowCount == 1) {
            socket.emit('updateProfile:done', { success: true, message: "Your profile has successfully been updated" });
            console.log(item.username + "s profile has been updated")
        } else {
            console.log('could not update')
            socket.emit('updateProfile:done', { success: false, error: err });
        }
    })
    .catch(err => {
        console.log('ERROR', err)
        socket.emit({ success: false, error: err });
    })
}

const getUserInfo = (username, res) => {
    const getInfo = {
        text: "SELECT * FROM users WHERE username=$1",
        values: [username]
    }

    const getViews = {
        text: "SELECT * FROM views WHERE views_current_user=$1",
        values: [username]
    }

    pool.query(getInfo).then((result => {
        if (result.rows[0]) {
            pool.query(getViews)
            .then(status => {
                console.log('STATUS', status.rows[0])
                let array = []
                let dis = []
                // for (const iliked of status) {
                //     if (iliked.status === 'like')
                //         array.push(iliked.subject)
                //     else if (iliked.status === 'dislike')
                //         dis.push(iliked.subject);
                // }
                // result.rows[0]['liked'] = array;
                // result.rows[0]['dislike'] = dis;
                res.json({ success: true, user: result.rows[0] })
            })
        }
        else {
            req.json({ success: false, error: 'An error has occurred' })
        }
    })).catch((err) => console.log('NON'));
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
