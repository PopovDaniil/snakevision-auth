const postgres = require('postgres')
const crypto = require('crypto')

const sql = postgres({
    host: process.env.AUTH_DB_HOST,
    username: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
});

const Users = {
    async add(user) {
        const { name, login, age, email, telephone, password } = user
        const res = await sql`
            INSERT INTO users (name, login, age, email, telephone, password)
            VALUES (${name},${login},${age},${email},${telephone},md5(${password}))
            RETURNING login, email, telephone`
            .catch(e => { throw new Error(e) })
        return res;
    },

    async login(opts) {
        const {login, password} = opts
        const user = await sql`
            SELECT id FROM users 
            WHERE login = ${login} 
            AND password = md5(${password})`
            .catch(e => { throw new Error(e) })
        if (!user.count) {
            return false;
        }
        const userId = user[0].id
        const token = crypto.randomBytes(16).toString('hex')
        console.log(userId);
        await sql`
            INSERT INTO logged_users VALUES (${token},${userId})`
            .catch(e => { throw new Error(e) })
        return token
    }
}

exports.users = Users