const postgres = require('postgres')

const sql = postgres({
    host: process.env.AUTH_DB_HOST,
    username: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
});

const Users = {
    async add(user) {
        const {name, login, age, email, telephone, password} = user
        let res = await sql`
            INSERT INTO users (name, login, age, email, telephone, password)
            VALUES (${name},${login},${age},${email},${telephone},md5(${password}))
            RETURNING login, email, telephone`
            .catch(e => {throw new Error(e)})
        return res;
    }
}

exports.users = Users