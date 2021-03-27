const postgres = require('postgres');
const db = postgres({
    host: process.env.AUTH_DB_HOST,
    username: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
});

const argv = require('process').argv;
if (argv[2] == 'up') {
    db`CREATE TABLE users(
        id serial PRIMARY KEY NOT NULL,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(32) NOT NULL,
        token CHAR(32)
    )`
} else if (argv[2] == 'down') {
    db`DROP TABLE users`
} else {
    throw new Error("Invalid argument, expected 'up' or 'down'")
}