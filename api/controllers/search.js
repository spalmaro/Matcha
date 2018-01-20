const mongodb = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/Matcha_DB";

module.exports = {
    search(data, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) { console.log(err); return; }
            db.collection('views').find({'currentUser' : data.user.username}, {'subject': 1}, (err, cursor) => {
          cursor.toArray((err, result) => {
            let query = {};
            if (data.search.interests.length){
              query.interests = {$elemMatch: data.search.interests}
            }
            if (data.user.orientation !== 'Both') {
              query.gender = data.user.orientation;
            } else {
              query.gender =  {$in: ['Male', 'Female']}
            }
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
                $maxDistance: data.search.distance
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
              query.interests = {$elemMatch: user.interests}
            }
            if (user.orientation !== 'Both') {
              query.gender = user.orientation
            } else {
              query.gender =  {$in: ['Male', 'Female']}
            }
            query.profilePicture = {$ne: ''};
            query.username = {$nin: user.blocked, $nin: result, $ne: user.username};
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
    }
}
