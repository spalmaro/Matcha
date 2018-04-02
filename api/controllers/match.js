const scoreCtrl = require('./score');
const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
})

module.exports = {

    setLikeDislike(data, socket) {
        console.log("setting like or dislike")
        const findViews = {
            text: "SELECT * FROM views WHERE views_current_user = $1 AND views_subject = $2",
            values: [data.currentUser, data.subject]
        }

        const updateViews = {
            text: "UPDATE views SET views_status = $1 WHERE views_current_user = $2 AND views_subject = $3",
            values: [data.status, data.currentUser, data.subject]
        }

        const insertViews = {
            text: "INSERT INTO views(views_current_user, views_subject, views_status) VALUES($1, $2, $3)",
            values: [data.currentUser, data.subject, data.status]
        }

        const insertNotifLike = {
            text: "INSERT INTO notifications(notif_type, notif_who, notif_from, notif_read, notif_date) VALUES('like', $1, $2, false, current_timestamp)",
            values: [data.subject, data.currentUser]
        }

        const insertNotifDislike = {
            text: "INSERT INTO notifications(notif_type, notif_who, notif_from, notif_read, notif_date) VALUES('dislike', $1, $2, false, current_timestamp)",
            values: [data.subject, data.currentUser]
        }

        pool.query(findViews).then(row => {
            if (row.rowCount) {
                pool.query(updateViews).then(update => {
                    console.log("views updated")
                }).catch(err => console.log(err))
            } else {
                pool.query(insertViews).then(result => {
                    console.log("views inserted")
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
        
        if (data.status === 'like') {
            this.checkMatch(data, socket);
            scoreCtrl.addScore(data);
            pool.query(insertNotifLike).then(like => {
                console.log("like notification created")
            }).catch(err => console.log(err))
        } else {
            scoreCtrl.subtractScore(data);
            pool.query(insertNotifDislike).then(update => {
                console.log("dislike notification created")
            }).catch(err => console.log(err))
        }
    },

    checkMatch(data, socket) {
        const findViews = {
            text: "SELECT * FROM views WHERE views_current_user = $1 AND views_subject = $2 AND views_status='like'",
            values: [data.subject, data.currentUser]
        }

        const insertMatch = {
            text: "INSERT INTO match(users, match_ts, match_read) VALUES($1, current_timestamp, $2)",
            values: [[data.subject, data.currentUser], false]
        }

        const insertNotif = {
            text: "INSERT INTO notifications(notif_type, notif_who, notif_from, notif_read, notif_date) VALUES ('match', $1, $2, false, current_timestamp), ('match', $2, $1, false, current_timestamp)",
            values: [data.subject, data.currentUser]
        }

        pool.query(findViews).then(row => {
            if (row.rowCount == 1) {
                pool.query(insertMatch).then(match => {
                    if (match.rowCount) {
                        socket.emit('match:post', {success: true})
                    }
                }).catch(err => console.log(err))
                pool.query(insertNotif).then(notif => {
                    if (notif.rowCount) {
                        console.log('notification created')
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
    }
}