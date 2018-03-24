const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/Matcha_DB';
const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
})

module.exports = {

    addScore(data) {
        const scoreAdd = {
            text: "UPDATE users SET score = score + 1 WHERE username = $1",
            values: [data.subject]
        }

        pool.query(scoreAdd).then(result => {
            if (result.rowCount == 1) {
                // socket.emit('updateProfile:done', { success: true, message: "Your profile has successfully been updated" });
                console.log("score incremented")
            } else {
                console.log('could not increment score')
                // socket.emit('updateProfile:done', { success: false, error: err });
            }
        })
        .catch(err => console.log(err))
    },

    subtractScore(data) {
        const scoreSubstract = {
            text: "UPDATE users SET score = score + 1 WHERE username = $1",
            values: [data.subject]
        }

        pool.query(scoreSubstract).then(result => {
            if (result.rowCount == 1) {
                console.log("score decremented")
            } else {
                console.log('could not decrement score')
            }
        })
        .catch(err => console.log(err))
    }
}