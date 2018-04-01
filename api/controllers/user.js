const assert = require('assert');

const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;
const jwt = require('jsonwebtoken');
const emailCtrl = require('./email');

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
                if (resu.rowCount == 1) {
                    const token = jwt.sign({ username: item[1], email: item[0] }, env.secret, {
                        expiresIn: 604800 // 1 week
                    });
                    res.json({ success: true, token: token, user: { username: item[1], email: item[0] } })
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

    let nex = [],
    e;
    if (item.liked) delete item.liked
    if (item.dislike) delete item.dislike
    if (item.lastconnected) delete item.lastconnected
    item['location'] = `(${item['location'].x}, ${item['location'].y})`;
    for (e in item)
        nex.push(item[e])

    const userUpdate = {
        text: "UPDATE users SET email = $2, username = $3, firstname = $4, lastname = $5, age = $6, dobday = $7, dobmonth = $8, dobyear = $9, password = $10, gender = $11, orientation = $12, description = $13, location = $14, address = $15, lastconnected = current_timestamp, profilepicture = $16, score = $17, blocked = $18, reportedby = $19, firstconnection = $20, interests = $21, picture1 = $22, picture2 = $23, picture3 = $24, picture4 = $25 WHERE user_uuid=$1",
        values: nex
    };

    pool.query(userUpdate).then(result => {
        if (result.rowCount == 1) {
            socket.emit('updateProfile:done', { success: true, message: "Your profile has successfully been updated" });
            console.log(item.username + "s profile has been updated")
        } else {
            console.log('could not update')
            socket.emit('updateProfile:done', { success: false, error: err });
        }
    })
    .catch(err => {
        console.log('ERROR UPDATE', err)
        socket.emit({ success: false, error: err });
    })
}

const getUserInfo = (username, res) => {
    const getInfo = {
        text: "SELECT * FROM users WHERE username=$1",
        values: [username]
    }

    const getViews = {
        text: "SELECT * FROM views WHERE views_current_user = $1",
        values: [username]
    }

    pool.query(getInfo).then((result => {
        if (result.rows[0]) {
            pool.query(getViews).then(status => {
                let array = []
                let dis = []
                if (status.rowCount) {
                    for (const iliked of status.rows) {
                        if (iliked.views_status === 'like')
                            array.push(iliked.views_subject)
                        else if (iliked.views_status === 'dislike')
                            dis.push(iliked.views_subject);
                    }
                } 
                result.rows[0]['liked'] = array;
                result.rows[0]['dislike'] = dis;
                res.json({ success: true, user: result.rows[0] })
            }).catch((err) => console.log(err));
        }
        else {
            res.json({ success: false, error: 'An error has occurred' })
        }
    })).catch((err) => console.log(err));
}

const reportUser = (data) => {
    const report = {
        text : "UPDATE users SET reportedBy = array_append(reportedBy, $1) WHERE username = $2",
        values : [data.currentUser, data.userToReport]
    }
    
    pool.query(report).then(result => {
        if (result.rowCount == 1) {
        socket.emit('report:post', { success: true });
        console.log("User was successfully reported")
    } else {
        console.log('could not report')
        socket.emit('report:post', { success: false, error: err });
    }
    })
    .catch(err => {
        console.log('ERROR', err)
        socket.emit({ success: false, error: err });
    })
}

const blockUser = (data) => {
    const block = {
        text : "UPDATE users SET blocked = array_append(blocked, $1) WHERE username = $2",
        values : [data.blockedUser, data.currentUser]
    }
    
    pool.query(block).then(result => {
        if (result.rowCount == 1) {
        socket.emit('block:post', { success: true });
        console.log("User was successfully blocked")
    } else {
        console.log('could not block')
        socket.emit('block:post', { success: false, error: err });
    }
    })
    .catch(err => {
        console.log('ERROR', err)
        socket.emit({ success: false, error: err });
    })
}

const forgotPassword = (email, res) => {
    const checkEmail = {
        text: "SELECT * FROM users WHERE email = $1",
        values: [email]
    }



    pool.query(checkEmail).then(row => {
        if (row.rowCount === 1) {
            let user_uuid = row.rows[0].user_uuid;
            const checkReset = {
                text: "SELECT * FROM password_reset WHERE user_uuid = $1",
                values: [user_uuid]
            }
            pool.query(checkReset).then(suc => {
                if (suc.rowCount !== 0) {
                    const delResend = {
                        text: "DELETE FROM password_reset WHERE user_uuid = $1",
                        values: [user_uuid]
                    }
                    pool.query(delResend).then(delSuccess => {
                        if (delSuccess.rowCount === 1) {
                            const getActivationUuid = {
                                text: "INSERT INTO password_reset(user_uuid) VALUES($1) RETURNING activation_uuid",
                                values: [user_uuid]
                            }
                            pool.query(getActivationUuid).then(result => {
                            if (result.rowCount === 1) {
                                emailCtrl.sendMail(email, result.rows[0].activation_uuid, (success => {
                                    if (success) res.json({success: true})
                                    else res.json({success: false, error: 'email not sent'})
                                }))
                            } else {
                                res.json({success: false, error: 'email not sent'})
                            }
                            }).catch(err => {
                                console.log('ERROR', err);
                                res.json({success: false, error: err})
                            })
                        } else {
                            res.json({success: false, error: 'email not sent'})
                        }
                    }).catch(err => {
                        console.log('ERROR', err);
                        res.json({success: false, error: err})
                    })
                } else {
                    const getActivationUuid = {
                        text: "INSERT INTO password_reset(user_uuid) VALUES($1) RETURNING activation_uuid",
                        values: [user_uuid]
                    }
                    pool.query(getActivationUuid).then(result => {
                        if (result.rowCount === 1) {
                            emailCtrl.sendMail(email, result.rows[0].activation_uuid, (success => {
                                if (success) res.json({success: true})
                                else res.json({success: false, error: 'email not sent'})
                            }))
                        } else {
                            res.json({success: false, error: 'email not sent'})
                        }
                    }).catch(err => {
                        console.log('ERROR', err);
                        res.json({success: false, error: err})
                    })
                }
            }).catch(err => {
                console.log('ERROR', err);
                res.json({success: false, error: err})
            })
        } else {
            res.json({success: false, error: 'invalid'})
        }
    }).catch(err => {
        console.log('ERROR', err)
        res.json({success: false, error: err})
    })
}

module.exports = {
    'addUser': addUser,
    'updateUser': updateUser,
    'getUserInfo': getUserInfo,
    'reportUser': reportUser,
    'blockUser': blockUser,
    'forgotPassword': forgotPassword
};
