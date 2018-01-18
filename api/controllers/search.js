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
              .find({age: { $and: [ { $gt: search.startAge }, { $lt: search.endAge }]},
                score: { $and: [ { $gt: search.startScore }, { $lt: search.endScore }] },
                location: {
                    // $geoNear: {type: },
                    maxDistance: search.maxDistance
                }
              });
        })
    },

    getList(user, socket) {
      mongodb.connect(url, (err, db) => {
        if (err) {
          console.log(err);
          socket.emit({ success: false, error: err });
          return;
        }
        let query = {};
        if (user.orientation !== 'Both') {
          query.gender = user.orientation
        }
        db.collection('users').find({interests: {$elemMatch: user.interests}})
      })
    }
}
