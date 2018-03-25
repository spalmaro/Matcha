const { Pool, Client } = require('pg')
const env = require('./environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;
var faker = require('faker');

const pool = new Pool({
    connectionString: connectionString,
})

function createRandomUser() {
    let gender = ['Male', 'Female'];
    let orientation = ['Both', 'Guys', 'Girls']
    let birthday = (faker.date.between('1950-01-01', '2000-03-31')).toISOString();
    let user = {
        email: faker.internet.email,
        username: faker.internet.userName(), firstname: faker.name.firstName(), lastname: faker.name.lastName(),
        age: getAge(birthday.slice(0, 4) + '-' + birthday.slice(5, 7) + '-' + birthday.slice(8, 10)),
        dobday: birthday.slice(8, 10), dobmonth: birthday.slice(5, 7), dobyear: birthday.slice(0, 4), password: faker.internet.password(),
        gender: gender[Math.floor(Math.random() * gender.length)], orientation: orientation[Math.floor(Math.random() * orientation.length)],
        description: faker.lorem.paragraph(), location: `(${faker.address.longitude()}, ${faker.address.latitude()})`,
        address: `${faker.address.city()}, ${faker.address.zipCode()}`, profilepicture: '', score: 10, blocked: [],
        reportedby: [], firstconnection: false, interests: [], picture1: '', picture2: '', picture3: '', picture4: '' };
    
    return user;
}

function addUser(item) {
    let user = createRandomUser();
    const insertUser = {
        text: 'INSERT INTO users(email, username, firstname, lastname, age, dobday, dobmonth, dobyear, password, gender, orientation, description, location, address, profilepicture, score, blocked, reportedby, firstconnection, interests,  picture1, picture2, picture3, picture4) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)',
        values: item
    }
    const checkUserExists = {
        text: 'SELECT (username, email) FROM users WHERE username=$1 OR email=$2',
        values: [item[1], item[0]]
    };

    pool.query(checkUserExists)
    .then(result => {
        if (result.rowCount == 1) {
            return ;
        } else {
            pool.query(insertUser)
            .then(resu => {})
            .catch(e => console.error("user", e.stack))
        }
    })
    .catch(e => console.error("nope", e.stack))
}