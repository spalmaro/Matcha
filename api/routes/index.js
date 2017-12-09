const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../controllers/User');
const database = require('../config/database')
const getAge = require('get-age')
const jwt = require('jsonwebtoken')
const env = require('../config/environment')

/* GET home page. */
// router.get('/', function (req, res, next) {
//   if (req.session.error) {
//     res.locals.error = req.session.error;
//     req.session.error = undefined;
//   }
//   res.render('index');
// });

router.post('/signup', (req, res, next) => {
  console.log('### bodyy',req.body)
  let item = {
    email: req.body.email,
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    age: getAge(req.body.dobyear + '-' + req.body.dobmonth + '-' + req.body.dobday),
    dobday: req.body.dobday,
    dobmonth: req.body.dobmonth,
    dobyear: req.body.dobyear,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)),
    gender: req.body.gender,
    orientation: 'Both',
    description: '',
    location: '',
    lastConnected: '',
    profilePicture: '',
    score: 10.00,
    interests: [],
    liked: [],
    disliked: [],
    firstConnection: true,
    picture1: '',
    picture2: '',
    picture3: '',
    picture4: ''
  }
  User.addUser(item, res);
  
  // req.session.user = req.body.login;
  // res.redirect('/edit');
})

router.post('/login', async (req, res, next) => {
  let db = await database.connect();
  let result = await db.collection('users').findOne({ $or: [{ 'email': req.body.email }, { 'username': req.body.username }] })

  if (result && bcrypt.compareSync(req.body.password, result['password'])) {
    const token = jwt.sign({ result }, env.secret, {
      expiresIn: 604800 // 1 week
    });
    res.json({ success: true, token: token, user: { username: result.username, email: result.email }, firstConnection: result.firstConnection })
    //should send userid and location as well
  }
  else if (result) {
    res.json({ success: false, msg: 'Wrong Password' })
  }
  else {
    res.json({success: false, msg: 'Login was not found'})
  }
})

module.exports = router;
