const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/Matcha_DB';
const moment = require('moment');
const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
})

module.exports = {

    setVisit(data) {
        const searchVisit = {
            text: "SELECT * FROM visit WHERE visit_subject = $1 AND visit_current_user = $2 ",
            values: [data.username, data.currentUser]
        }

        const insertVisit = {
            text: "INSERT INTO visit(visit_current_user, visit_subject) VALUES($1, $2) ",
            values: [data.username, data.currentUser]
        }

        const setNotification = {
            text: "INSERT INTO notifications(notif_type, notif_who, notif_from, notif_read, notif_date) VALUES($1, $2, $3, $4, $5)",
            values: ['visit', data.username, data.currentUser, false, new Date().getTime()]
        }

        pool.query(searchVisit).then(result => {
            if (result.rowCount == 1) return
            else {
                pool.query(insertVisit).then(row => {
                    pool.query(setNotification).then(
                        console.log('notification sent')
                    ).catch(err => console.log(err))
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
    },

    getNotifications(data, socket) {
        const getNotif = {
            text: "SELECT * FROM notifications WHERE notif_who = $1 AND notif_from <> ALL ($2) ORDER BY notif_date DESC",
            values: [data.username, data.blocked]
        }

        pool.query(getNotif).then(result => {
            console.log(result, '--- Original mongodb needs array ---')
            if (result.rowCount)
                socket.emit('notifications:post', result.rows[0]);
        }).catch(err => console.log(err))
    },

    readNotifications(data, socket) {
        const markRead = {
            text: "UPDATE notifications SET read = true WHERE notif_who = $1",
            values: [data]
        }

        pool.query(markRead).then(result =>{
            if (result.rowCount)
                console.log('notifications marked as read')
        }).catch(err => console.log(err))
    },

    sendMessage(data, socket) {
        const findConversation = {
            text: "SELECT * FROM match WHERE ($1 = ANY (users)) AND ($2 = ANY (users)) ",
            values: [data.to, data.from]
        }

        pool.query(findConversation).then(row => {
            if (row.rowCount == 1) {
                const sendMsg = {
                    text: "INSERT INTO messages(match_uuid, msg_from, msg_to, msg_msg, msg_ts) VALUES($1, $2, $3, $4)",
                    values: [row.rows[0].match_uuid, data.from, data.to, data.message, data.timestamp]
                }
                pool.query(sendMsg).then(result => {
                    if (result.rowCount == 1)
                        console.log('message sent')
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))

        // mongodb.connect(url, (err, db) => {
        //     if (err) throw err;
        //     console.log('lakdjflaksjdf', data)
        //     db.collection('match').findOne({users: {$all: [data.to, data.from]}}, (err, result) => {
        //         if (err) throw err;
        //         if (result) {
        //             let message = {};
        //             messsage['to'] = data.to;
        //             message['from'] = data.from;
        //             message['message'] = data.message;
        //             message['timestamp'] = data.timestamp;
        //             let msg = result.messages.push(message);
        //             db.collection('match').update({'users': {$all: [data.to, data.from]}}, {$set:  {'messages': msg, 'read': false}}, (err, result) => {
        //                 if (err) throw err;
        //             })
        //         }
        //     })
        // })
    },

    getConversations(data, socket) {
        //NEED TO ORDER BY TIMESTAMP OF LAST MESSAGES IF EXISTS ELSE BY TIMESTAMP OF MATCH
        const findConversations = {
            text: "SELECT * FROM match WHERE ($1 = ANY (users)) ORDER BY match_ts DESC, ",
            values: [data.username]
        }

        pool.query(findConversations).then(result => {
            if (result.rowCount) {
                socket.emit("conversations:post", {result: result.rows[0]})
            }
        }).catch(err => console.log(err))
    },

    getMessages(data, socket) {
        //toArray
        console.log('MESSAGE GET', data)
        const findConversation = {
            text: "SELECT * FROM match WHERE ($1 = ANY (users)) AND ($2 = ANY (users)) ",
            values: [data.to, data.from]
        }

        pool.query(findConversation).then(row => {
            console.log('row --->', row.rows)
            if (row.rowCount == 1) {
                const getMsgs = {
                    text: "SELECT * FROM messages WHERE match_uuid = $1 ORDER BY msg_ts DESC",
                    values: [row.rows[0].match_uuid]
                }
                pool.query(getMsgs).then(result => {
                    if (result.rowCount) {
                        socket.emit('messages:post', result.rows);
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
        // mongodb.connect(url, (err, db) => {
        //     if (err) {
        //         throw err;
        //     }
        //     db.collection('match').find({'users': data.username}).sort({'timestamp': -1, 'messages.timestamp': -1}).toArray((err, result) => {
        //         if (err) throw err;
        //         socket.emit('messages:post', result);
        //     })
        // })
    },

    getLikedBy(data, socket) {
        const likedBy = {
            text: "SELECT * FROM views WHERE views_subject = $1 AND views_status = 'like'",
            values: [data]
        }

        pool.query(likedBy).then(result => {
            socket.emit('likeby:post', result.rows);
        }).catch(err => console.log(err))
    },

    getViewedBy(data, socket) {
        const viewdBy = {
            text: "SELECT * FROM visit WHERE visit_subject = $1 ",
            values: [data]
        }

        pool.query(viewdBy).then(result => {
            socket.emit('viewdby:post', result.rows);
        }).catch(err => console.log(err))
    }


}