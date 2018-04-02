const { Pool, Client } = require('pg')
const env = require('./environment');

const pool = new Pool({
  user: env.PGUSER,
  host: env.PGHOST,
  password: env.PGPASSWORD,
  port: env.PGPORT
});

let query = ``

pool.query('CREATE DATABASE IF NOT EXISTS Matcha_DB', (err, res) => {
    if (err) throw err;
    console.log('DB exists or was just created');
})

pool.query('')