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
                console.log("score incremented")
            } else {
                console.log('could not increment score')
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