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
        let viewed = '';
        let x = 0;
        for (let subject of row.rows) {
          if (x < row.rows.length - 1)
            viewed = viewed.concat(`'${subject.views_subject}', `);
          else if (x === row.rows.length - 1) {
            viewed = viewed.concat(`'${subject.views_subject}'`);
          }
          x++;
        }
        let interests = '';
        for (let i in data.search.interests) {
          if (i < data.search.interests.length - 1)
            interests = interests.concat(`'${data.search.interests[i]}',`);
          else
            interests = interests.concat(`'${data.search.interests[i]}'`);
        }
        let query = `SELECT * FROM users i, ST_Distance(ST_POINT($3, $4)::geometry, location::geometry) as dist WHERE `
        if (data.search.interests.length){
          query = query.concat(`interests && ARRAY[${interests}] AND `)
        } 
        if (data.user.orientation !== 'Both') {
          let gender = data.user.orientation == 'Guys' ? 'Male' : 'Female'
          query = query.concat(`gender = ${gender}`)
        } else {
          query = query.concat("gender IN ('Male', 'Female')")
        }
        let orientation = data.user.gender == 'Male' ? 'Guys' : 'Girls';
        let viewedQuery = viewed.length ? viewed : `''`;
        query = query.concat(` AND orientation IN ('${orientation}', 'Both') AND NOT profilepicture = '' AND NOT username IN ($1) AND NOT username IN (${viewedQuery}) AND NOT username = $2 AND score >= $5 `)
        if (data.search.endAge !== 65) {
          query = query.concat(`AND age BETWEEN $6 AND ${data.search.endAge} `);
        } else {
          query = query.concat(`AND age >= $6 `)
        }
        if (data.search.endScore !== 100)
          query = query.concat(`AND score <= ${data.search.endScore} `);
        
        query = query.concat('AND dist <= $7 ORDER BY dist, i.score LIMIT 16 ')

        // console.log('FINAL QUERY LOOKS LIKE DIS  ', query)
  
        let sortPeople = {
          text : query,
          values: [data.user.blocked, data.user.username, long, lat, data.search.startScore, data.search.startAge, (data.search.distance * 1000)]
        }
  
        pool.query(sortPeople).then(result => {
          if (result.rowCount > 0) {
            socket.emit('search:post', result.rows)
          } else {
            console.log('posting', result.rows)
            socket.emit('search:post', []);
          }
        })
      })
    },

    getList(user, res) {
      let long = user.location.x;  
      let lat = user.location.y;
      let findViews = {
        text: "SELECT views_subject FROM views WHERE views_current_user = $1",
        values: [user.username]
      }

      pool.query(findViews).then(row => {
        let viewed = '';
        i = 1;
        for (let subject of row.rows) {
          if (i < row.rows.length)
            viewed = viewed.concat(`'${subject.views_subject}', `);
          else
            viewed = viewed.concat(`'${subject.views_subject}'`);
          i++;
        }
        viewed = viewed ? viewed : `''`;
        let query = `SELECT * FROM users i, LATERAL (
          SELECT count(*) AS ct
          FROM   unnest(i.interests) uid
          WHERE  uid = ANY ($1)
          ) x, ST_Distance(ST_POINT($4, $5)::geometry, location::geometry) as dist
          WHERE `
        if (user.orientation !== 'Both') {
          let gender = user.orientation == 'Guys' ? 'Male' : 'Female'
          query = query.concat(`gender = ${gender}`)
        } else {
          query = query.concat("gender IN ('Male', 'Female')")
        }
        let orientation = user.gender == 'Male' ? 'Guys' : 'Girls';
        query = query.concat(` AND orientation IN ('${orientation}', 'Both') AND NOT profilepicture = '' AND NOT username IN ($2) AND NOT username IN (${viewed}) AND NOT username = $3`)
        query = query.concat(' ORDER BY dist, x.ct DESC, i.score LIMIT 16')

        // console.log('FINAL QUERY LOOKS LIKE DIS  ', query)
  
        let sortPeople = {
          text : query,
          values: [user.interests, user.blocked, user.username, long, lat]
        }
  
        pool.query(sortPeople).then(result => {
          console.log(result.rowCount)
          if (result.rowCount > 0) {
            res.json({ list: result.rows });
          } else {
            res.json({ list: [] });
          }
        }).catch(err => {
          console.error(err);
          res.json({ list: [] });  
        })
      }).catch(err => {
        console.error(err);
        res.json({ success: false });
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
