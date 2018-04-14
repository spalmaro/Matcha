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
            text: "SELECT * FROM visit WHERE visit_subject = $2 AND visit_current_user = $1 ",
            values: [data.username, data.currentUser]
        }

        const insertVisit = {
            text: "INSERT INTO visit(visit_current_user, visit_subject) VALUES($1, $2) ",
            values: [data.username, data.currentUser]
        }

        const setNotification = {
            text: "INSERT INTO notifications(notif_type, notif_who, notif_from, notif_read, notif_date) VALUES($1, $2, $3, $4, current_timestamp)",
            values: ['visit', data.username, data.currentUser, false]
        }

        pool.query(searchVisit).then(result => {
            if (result.rowCount) return
            else {
                pool.query(insertVisit).then(row => {
                    pool.query(setNotification).then(
                        console.log('notification sent')
                    ).catch(err => console.log('setVisit Error', err))
                }).catch(err => console.log('Set visit error 2', err))
            }
        }).catch(err => console.log(err))
    },

    getNotifications(data, socket) {
        const getNotif = {
            text: "SELECT * FROM notifications WHERE notif_who = $1 AND notif_from <> ALL ($2) ORDER BY notif_date DESC",
            values: [data.username, data.blocked]
        }

        pool.query(getNotif).then(result => {
            if (result.rowCount)
                socket.emit('notifications:post', result.rows);
        }).catch(err => console.log('get notifications error ',err))
    },

    readNotifications(data, socket) {
        const markRead = {
            text: "UPDATE notifications SET notif_read = true WHERE notif_who = $1 AND NOT notif_type = 'message'",
            values: [data]
        }

        pool.query(markRead).then(result =>{
            if (result.rowCount)
                console.log('notifications marked as read')
        }).catch(err => console.log(err))
    },

    readMessages(data, socket) {
        const markRead = {
            text: "UPDATE notifications SET notif_read = true WHERE notif_who = $1 AND notif_type = 'message'",
            values: [data]
        }

        pool.query(markRead).then(result =>{
            if (result.rowCount)
                console.log('notifications marked as read')
        }).catch(err => console.log(err))
    },

    readConversations(data, socket) {
        const markRead = {
            text: "UPDATE match SET match_read = true WHERE ($1 = ANY (users)) AND ($2 = ANY (users))",
            values: [data.currentUser, data.buddy.username]
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

        const sendNotification = {
            text: "INSERT INTO notifications(notif_type, notif_who, notif_from, notif_read, notif_date) VALUES ('message', $1, $2, false, current_timestamp)",
            values: [data.to, data.from]
        }

        pool.query(findConversation).then(row => {
            if (row.rowCount == 1) {
                const sendMsg = {
                    text: "INSERT INTO messages(match_uuid, msg_from, msg_to, msg_msg) VALUES($1, $2, $3, $4)",
                    values: [row.rows[0].match_uuid, data.from, data.to, data.message]
                }
                pool.query(sendMsg).then(result => {
                    if (result.rowCount == 1) {
                        console.log('message sent')
                        pool.query(sendNotification).then(count => {
                            if (count.rowCount) {
                                const unreadMatch = {
                                    text: "UPDATE match SET match_read = false WHERE match_uuid = $1",
                                    values: [row.rows[0].match_uuid]
                                }
                                pool.query(unreadMatch).then(another => {}).catch(err => console.log('mark match unread err', err))
                            }
                        }).catch(err => console.log('sendMessage notification err => ', err))
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
    },

    getConversations(data, socket) {
        //NEED TO ORDER BY TIMESTAMP OF LAST MESSAGES IF EXISTS ELSE BY TIMESTAMP OF MATCH
        const findConversations = {
            text: "SELECT * FROM match WHERE ($1 = ANY (users)) ORDER BY match_ts DESC",
            values: [data.username]
        }

        pool.query(findConversations).then(result => {
            //check if its in array order for unread !!!!
            if (result.rowCount) {
                let people = result.rows;
                let arr = [];
                let unread = []
                for (let x of people) {
                    if (x.users[0] != data.username)
                        arr.push(x.users[0]);
                    else
                        arr.push(x.users[1]);
                    unread.push(x.match_read);
                }
                const getPeople = {
                    text: "SELECT username, firstname, lastname, profilepicture FROM users WHERE username IN ($1)",
                    values: [arr.toString()]
                }
                pool.query(getPeople).then(row => {
                    if (row.rows) {
                        let ppl = row.rows;
                        i = 0;
                        for (let u of ppl) {
                            u['read'] = unread[i];
                            i++;
                        }
                        socket.emit("conversations:post", {result: row.rows})
                    }
                }).catch(err => console.log('People Error', err))
            }
        }).catch(err => console.log('get convo errorr', err))
    },

    getMessages(data, socket) {
        const findConversation = {
            text: "SELECT * FROM match WHERE ($1 = ANY (users)) AND ($2 = ANY (users)) ",
            values: [data.to, data.from.username]
        }

        pool.query(findConversation).then(row => {
            if (row.rowCount == 1) {
                const getMsgs = {
                    text: "SELECT * FROM messages WHERE match_uuid = $1 ORDER BY msg_ts ASC",
                    values: [row.rows[0].match_uuid]
                }
                pool.query(getMsgs).then(result => {
                    if (result.rowCount) {
                        socket.emit('messages:post', result.rows);
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
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
    },

    checkChatMatch(data, socket) {
        const checkMatch = {
            text: "SELECT * FROM match WHERE ($1 = ANY (users)) AND ($2 = ANY (users)) ",
            values: [data.who, data.currentUser]
        }

        pool.query(checkMatch).then(result => {
            if (result.rowCount > 0) {
                socket.emit('checkMatchChat:post', {exists: true})
            } else {
                socket.emit('checkMatchChat:post', {exists: false})
            }
        }).catch(err => {
            console.log('Error =>', err)
            socket.emit('checkMatchChat:post', {exists: true})
        })
    }

    
}