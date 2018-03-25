const mongodb = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/Matcha_DB";

const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
})

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    search(data, socket) {
        mongodb.connect(url, (err, db) => {
          if (err) { console.log(err); return; }
          db.collection('views').find({'currentUser': data.user.username}, {'subject': 1}, (err, cursor) => {
          cursor.toArray((err, result) => {
			let query = {};
			console.log('###data =>', data.search.interests);
            if (data.search.interests.length){
              query.interests = {$in: data.search.interests}
            }
			if (data.user.orientation !== 'Both') {
              query.gender = data.user.orientation == 'Guys' ? 'Male' : 'Female'
            } else {
              query.gender =  {$in: ['Male', 'Female']}
            }
            query.orientation = {$in: [data.user.gender == 'Male' ? 'Guys' : 'Girls' , 'Both']} ;
            query.profilepicture = {$ne: ''};
            query.score = {$gte: data.search.startScore};
			query.age = {$gte: data.search.startAge}
            if (data.search.endAge !== 65) {
              query.age['$lte'] = data.search.endAge;
            }
            if (data.search.endScore !== 100)
              query.score['$lte'] = data.search.endAge;
            query.username = {$nin: data.user.blocked, $nin: result, $ne: data.user.username};
            query.location = {
              $nearSphere: {
                $geometry: {
                  type: "Point",
                  coordinates: data.user.location
                },
                $minDistance: 0,
                $maxDistance: data.search.distance * 1000
              }
			}
            db.collection('users').find(query).sort({'score' : 1}).limit(16).toArray((err, items) => {
			  if (err) throw err ;
              socket.emit('search:post', items);
            })
          })
        })
        })
    },

    getList(user, socket)
    {
      let currentUserGender = ucfirst(user.gender),
          currentUserOrientation = ucfirst(user.orientation),
          queryOrientation = [],
          queryGender = [],
          user_uuid = user.user_uuid;

          // user.queryGender = 'male';
          // user.queryOrientation = 'Guys';

      if (currentUserGender === 'Male')
      {
        if (currentUserOrientation === 'Girls')
        {
          queryGender.push(['Female']);
          queryOrientation.push(['Guys', 'Both']);
        }
        else if (currentUserOrientation === 'Guys')
        {
          queryGender.push(['Male']); 
          queryOrientation.push(['Guys', 'Both']);
        }
        else if (currentUserOrientation === 'Both')
        {
          queryGender.push(['Male', 'Female']); 
          queryOrientation.push(['Guys', 'Both']);
        }
      }
      else if (currentUserGender === 'Female')
      {

        if (currentUserOrientation === 'Girls')
        {
          queryGender.push(['Female']);
          queryOrientation.push(['Girls', 'Both']);
        }
        else if (currentUserOrientation === 'Guys')
        {
          queryGender.push(['Male']); 
          queryOrientation.push(['Girls', 'Both']);
        }
        else if (currentUserOrientation === 'Both')
        {
          queryGender.push(['Male', 'Female']); 
          queryOrientation.push(['Girls', 'Both']);
        }
      }
      else
        queryGender = null;


      console.log('current =', user.gender, user.orientation)
      console.log(queryGender, queryOrientation)
      if (!queryGender || !queryOrientation)
        return false;


      // for(var i = 1; i <= data.length; i++) {
      //   data.push('$' + i);
      // }

      const checkUserExists = {
        text: `SELECT (username, gender, orientation) FROM users WHERE gender = ANY('{${queryGender.join(',')}}') AND orientation = ANY('{${queryOrientation.join(',')}}') AND user_uuid != $1`,
        values: [user_uuid]
      };

      pool.query(checkUserExists)
      .then(res =>
      {
          console.log('res = ', res.rows)
      })
      .catch(err =>
      {
          console.log('err = ', err)
      })

      // return (false);

      // mongodb.connect(url, (err, db) => {
      //   if (err) { console.log(err); return; }
      //   db.collection('views').find({'currentUser' : user.username}, {'subject': 1}, (err, cursor) => {
      //     cursor.toArray((err, result) => {
      //       let query = {};
      //       if (user.interests.length){
      //         query.interests = {$in: user.interests}
      //       }
      //       if (user.orientation !=== 'Both') {
      //         query.gender = user.orientation == 'Guys' ? 'Male' : 'Female'
      //       } else {
      //         query.gender =  {$in: ['Male', 'Female']}
      //       }
      //       query.orientation = {$in: [user.gender == 'Male' ? 'Guys' : 'Girls' , 'Both']} ;
      //       query.profilepicture = {$ne: ''};
      //       let viewed = []
      //       for (let subject of result) {
      //         viewed.push(subject.subject);
      //       }
      //       query.username = {$nin: user.blocked, $nin: viewed, $ne: user.username};
      //       query.location = {
      //         $nearSphere: {
      //           $geometry: {
      //             type: "Point",
      //             coordinates: user.location
      //           },
      //           $minDistance: 0,
      //           $maxDistance: 160000
      //         }
      //       }
      //       db.collection('users').find(query).sort({'score' : 1}).limit(16).toArray((err, items) => {
      //         if (err) throw err ;
      //         socket.emit('list:post', items);
      //       })
      //     })
      //   })
      // })
    },

    getProfile(username, socket) {
      mongodb.connect(url, (err, db) => {
        if (err)
          throw err;
        db.collection('users').findOne({'username': username}, (err, result) => {
          if (err) throw err;
          if (result) {
            socket.emit('profile:post', result)
          } else {
            socket.emit('profile:post', {});
          }
        })
      })
    }
}
