const mongodb = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/Matcha_DB";
const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
})

module.exports = {
    search(data, socket) {
      let long = data.user.location.x;  
      let lat = data.user.location.y;
      let findViews = {
        text: "SELECT views_subject FROM views WHERE views_current_user = $1",
        values: [data.user.username]
      }

      pool.query(findViews).then(row => {
        let viewed = []
        for (let subject of row.rows) {
          viewed.push(subject.views_subject);
        }
        let query = `SELECT * FROM users i, ST_Distance(ST_POINT($4, $5)::geometry, location::geometry) as dist WHERE `
        if (data.search.interests.length){
          query = query.concat(`interests IN (${data.search.interests}) AND `)
        } 
        if (data.user.orientation !== 'Both') {
          let gender = data.user.orientation == 'Guys' ? 'Male' : 'Female'
          query = query.concat(`gender = ${gender}`)
        } else {
          query = query.concat("gender IN ('Male', 'Female')")
        }
        let orientation = data.user.gender == 'Male' ? 'Guys' : 'Girls';
        query = query.concat(` AND orientation IN ('${orientation}', 'Both') AND NOT profilepicture = '' AND NOT username IN ($1) AND NOT username IN ($2) AND NOT username = $3 AND score >= $6 AND age >= $7 `)
        if (data.search.endAge !== 65) {
          query = query.concat(`AND age <= ${data.search.endAge}`);
        }
        if (data.search.endScore !== 100)
          query = query.concat(`AND score <= ${data.search.endScore}`);
        
        query = query.concat(' AND dist <= $8 ORDER BY dist, i.score LIMIT 16')

        console.log('FINAL QUERY LOOKS LIKE DIS  ', query)
  
        let sortPeople = {
          text : query,
          values: [data.user.blocked, viewed, data.user.username, long, lat, data.search.startScore, data.search.startAge, (data.search.distance * 1000)]
        }
  
        pool.query(sortPeople).then(result => {
          if (result.rowCount > 0) {
            socket.emit('list:post', result.rows)
          } else {
            socket.emit('list:post', []);
          }
        })
      })
    },

    getList(user, socket) {
      let long = user.location.x;  
      let lat = user.location.y;
      let findViews = {
        text: "SELECT views_subject FROM views WHERE views_current_user = $1",
        values: [user.username]
      }

      pool.query(findViews).then(row => {
        let viewed = []
        for (let subject of row.rows) {
          viewed.push(subject.views_subject);
        }
        let query = `SELECT * FROM users i, LATERAL (
          SELECT count(*) AS ct
          FROM   unnest(i.interests) uid
          WHERE  uid = ANY ($1)
          ) x, ST_Distance(ST_POINT($5, $6)::geometry, location::geometry) as dist
          WHERE `
        if (user.orientation !== 'Both') {
          let gender = user.orientation == 'Guys' ? 'Male' : 'Female'
          query = query.concat(`gender = ${gender}`)
        } else {
          query = query.concat("gender IN ('Male', 'Female')")
        }
        let orientation = user.gender == 'Male' ? 'Guys' : 'Girls';
        query = query.concat(` AND orientation IN ('${orientation}', 'Both') AND NOT profilepicture = '' AND NOT username IN ($2) AND NOT username IN ($3) AND NOT username = $4`)
        query = query.concat(' ORDER BY dist, x.ct DESC, i.score LIMIT 16')

        // console.log('FINAL QUERY LOOKS LIKE DIS  ', query)
  
        let sortPeople = {
          text : query,
          values: [user.interests, user.blocked, viewed, user.username, long, lat]
        }
  
        pool.query(sortPeople).then(result => {
          if (result.rowCount > 0) {
            socket.emit('list:post', result.rows)
          } else {
            socket.emit('list:post', []);
          }
        })
      })
    },

    getProfile(username, res) {
      const findUser = {
        text: "SELECT * FROM users WHERE username = $1",
        values: [username]
      }

      pool.query(findUser).then(result => {
        if (result.rowCount) {
          res.json(result.rows[0]);
        } else {
          res.json({});
        }
      })

    }
}
