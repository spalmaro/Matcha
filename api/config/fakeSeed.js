//node filepath

const { Pool, Client } = require('pg')
const env = require('./environment')
const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;
var faker = require('faker');
const getAge = require('get-age');

const pool = new Pool({
    connectionString: connectionString,
})

function createRandomUser() {
    let gender = ['Male', 'Female'];
    let orientation = ['Both', 'Guys', 'Girls']
    let birthday = (faker.date.between('1950-01-01', '2000-03-31')).toISOString();
    let interests = [];

    for (i = 0; i <= 10; i++) {
        interests.push('#' + faker.lorem.word())
    }
    let user = [
        faker.internet.email,
        faker.internet.userName(),
        faker.name.firstName(),
        faker.name.lastName(),
        getAge(birthday.slice(0, 4) + '-' + birthday.slice(5, 7) + '-' + birthday.slice(8, 10)),
        birthday.slice(8, 10),
        birthday.slice(5, 7),
        birthday.slice(0, 4),
        faker.internet.password(),
        gender[Math.floor(Math.random() * gender.length)],
        orientation[Math.floor(Math.random() * orientation.length)],
        faker.lorem.paragraph(),
        `(${faker.address.longitude()}, ${faker.address.latitude()})`,
        `${faker.address.city()}, ${faker.address.zipCode()}`,
        'url(' + faker.image.people() + ')',
        10,
        [],
        [],
        false,
        interests,
        'url(' + faker.image.nature() + ')', 
        'url(' + faker.image.animals() + ')', 
        'url(' + faker.image.nightlife() + ')',
        'url(' + faker.image.imageUrl() + ')'
    ];
    
    return user;
}

function addUser() {
    let user = createRandomUser();
    const insertUser = {
        text: 'INSERT INTO users(email, username, firstname, lastname, age, dobday, dobmonth, dobyear, password, gender, orientation, description, location, address, profilepicture, score, blocked, reportedby, firstconnection, interests,  picture1, picture2, picture3, picture4) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)',
        values: user
    }
    const checkUserExists = {
        text: 'SELECT (username, email) FROM users WHERE username=$1 OR email=$2',
        values: [user[1], user[0]]
    };

    pool.query(checkUserExists)
    .then(result => {
        if (result.rowCount > 0) {
            return ;
        } else {
            pool.query(insertUser)
            .then(resu => {})
            .catch(e => console.error("user", e.stack))
        }
    })
    .catch(e => console.error("nope", e.stack))
}

for (x = 0; x <= 1000; x++) {
    addUser();
}