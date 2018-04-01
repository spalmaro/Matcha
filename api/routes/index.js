const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../controllers/User');
const Search = require('../controllers/search');
const getAge = require('get-age')
const jwt = require('jsonwebtoken')
const { Pool, Client } = require('pg')
const env = require('../config/environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`

const pool = new Pool({
    connectionString: connectionString,
})

router.post('/signup', (req, res, next) => {

  let item = [
    req.body.email, req.body.username, req.body.firstname, req.body.lastname, getAge(req.body.dobyear + '-' + req.body.dobmonth + '-' + req.body.dobday), req.body.dobday,
    req.body.dobmonth, req.body.dobyear, bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)), req.body.gender,
    'Both', '', '(0, 0)', '', '', 10, [], [], true, [], '', '', '', ''
  ]
  User.addUser(item, res);
})

router.post('/login', async (req, res, next) => {
  let checkPassword = {
    text: "SELECT username, email, password, firstconnection FROM users WHERE username=$1",
    values: [req.body.username]
  }
  try {
    let result = await pool.query(checkPassword)
    if (result.rows[0] && bcrypt.compareSync(req.body.password, result.rows[0]['password'])) {

      const token = jwt.sign({username: result.rows[0].username, email: result.rows[0].email}, env.secret, {
        expiresIn: 604800 // 1 week
      });
      console.log("connect", result.rows);
      res.json({ success: true, token: token, user: { username: result.rows[0].username, email: result.rows[0].email }, firstconnection: result.rows[0].firstconnection })
    }
    else if (result.rows[0]) {
      res.json({ success: false, msg: 'Wrong Password' })
    }
    else {
      res.json({success: false, msg: 'Login was not found'})
    }
  } catch(err) {
    console.log(err.stack)
  }

})

router.get('/getUserInfo', (req, res, next) => {
  User.getUserInfo(req.query.username, res)
})

router.get('/getProfile', (req, res, next) => {
  Search.getProfile(req.query.username, res)
})

router.post('/forgotpassword', (req, res, next) => {
  User.forgotPassword(req.body.email, res)
})

module.exports = router;
