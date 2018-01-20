const mongodb = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/Matcha_DB";

module.exports = {
    search(search, socket) {
        mongodb.connect(url, (err, db) => {
            if (err) {
                console.log(err);
                socket.emit({ success: false, error: err });
                return;
            }
            db.collection("users")
              .find({'age': { $and: [ { $gt: search.startAge }, { $lt: search.endAge }]},
                'score': { $and: [ { $gt: search.startScore }, { $lt: search.endScore }] },
                'location': {
                    // $geoNear: {type: },
                    maxDistance: search.maxDistance
                }
              });
        })
    },

    getList(user, socket) {
      mongodb.connect(url, (err, db) => {
        if (err) { console.log(err); return; }
        db.collection('views').find({'currentUser' : user.username}, {'subject': 1}, (err, cursor) => {
          cursor.toArray((err, result) => {
            console.log('TEST',result)
            let query = {};
            if (user.interests.length){
              query.interests = {$elemMatch: user.interests}
            }
            if (user.orientation !== 'Both') {
              query.gender = user.orientation
            } else {
              query.gender =  {$in: ['Male', 'Female']}
            }
            // query.profilePicture = {$ne: ''};
            query.username = {$nin: user.blocked, $nin: result, $ne: user.username};
            query.location = {
              $nearSphere: {
                $geometry: {
                  type: "Point",
                  coordinates: user.location
                },
                $minDistance: 10000,
                $maxDistance: 160000
              }
            }
            console.log("QUERY -> ", query);
            db.collection('users').find(query).sort({'score' : 1}).limit(16).toArray((err, items) => {
              console.log('ITEMS', items)
              socket.emit('list:post', items);
            })
          })
        })
      })
    }
}
