const mongodb = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/Matcha_DB";

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
            query.profilePicture = {$ne: ''};
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

    getList(user, socket) {
      mongodb.connect(url, (err, db) => {
        if (err) { console.log(err); return; }
        db.collection('views').find({'currentUser' : user.username}, {'subject': 1}, (err, cursor) => {
          cursor.toArray((err, result) => {
            let query = {};
            if (user.interests.length){
              query.interests = {$in: user.interests}
            }
            if (user.orientation !== 'Both') {
              query.gender = user.orientation == 'Guys' ? 'Male' : 'Female'
            } else {
              query.gender =  {$in: ['Male', 'Female']}
            }
            query.orientation = {$in: [user.gender == 'Male' ? 'Guys' : 'Girls' , 'Both']} ;
            query.profilePicture = {$ne: ''};
            let viewed = []
            for (let subject of result) {
              viewed.push(subject.subject);
            }
            query.username = {$nin: user.blocked, $nin: viewed, $ne: user.username};
            query.location = {
              $nearSphere: {
                $geometry: {
                  type: "Point",
                  coordinates: user.location
                },
                $minDistance: 0,
                $maxDistance: 160000
              }
            }
            db.collection('users').find(query).sort({'score' : 1}).limit(16).toArray((err, items) => {
              if (err) throw err ;
              socket.emit('list:post', items);
            })
          })
        })
      })
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
