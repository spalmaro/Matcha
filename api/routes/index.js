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

  let item = [
    '', req.body.email,req.body.username, req.body.firstname, req.body.lastname, getAge(req.body.dobyear + '-' + req.body.dobmonth + '-' + req.body.dobday), req.body.dobday,
    req.body.dobmonth, req.body.dobyear, bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)),req.body.gender,
    'Both', '', [0, 0], '', '', '', 10, [], [], [],  true, '', '', '', ''
  ]
  User.addUser(item, res);
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
