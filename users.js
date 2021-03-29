const postgres = require('postgres')
const crypto = require('crypto')

const sql = postgres({
    host: process.env.AUTH_DB_HOST,
    username: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
});

/**
 * Объект, содержащий данные из БД и информацию о состоянии
 */
class Status {
    /** @type {Object} Данные из БД */
    data = {};
    /** @type {string}*/
    error;
    /** @type {string}*/
    info;
    Status() { }
    toJSON() {
        if (this.error) {
            return {
                error: this.error
            }
        } else {
            return {
                data: this.data,
                info: this.info
            }
        }
    }
}


const Users = {
    /**
     * Добавляет нового пользователя
     * @param {Object} opts
     * @returns {Status}
     * @throws {Error}
     */
    async add(opts) {
        const { name, login, age, email, telephone, password } = opts
        let res = new Status()
        const user = await sql`
            INSERT INTO users (name, login, age, email, telephone, password)
            VALUES (${name},${login},${age},${email},${telephone},md5(${password}))
            RETURNING login, email, telephone`
            .catch(e => {
                // Код ошибки при добавлении не уникального значения 
                if (e.code = '23505') {
                    res.error = "Login, email or telephone is already in use"
                }
                else throw new Error(e)
            })
        res.data = user[0]
        res.info = "User successfully registered"
        return res
    },

    async login(opts) {
        const { login, password } = opts
        let res = new Status()

        const user = await sql`
            SELECT id FROM users 
            WHERE login = ${login} 
            AND password = md5(${password})`
            .catch(e => { throw new Error(e) })
        if (!user.count) {
            res.error = "Login or password is not correct"
            return res;
        }
        const userId = user[0].id
        let token = crypto.randomBytes(16).toString('hex');
        try {
            await sql`
            INSERT INTO logged_users VALUES (${token},${userId})`
            res.info = "User successfully logged in"
        } catch (e) {
            if (e.code = '23505') {
                token = (await sql`
                    SELECT token FROM logged_users WHERE user_id = ${userId}`)[0].token
                res.info = "User has already been logged in"
            } else
                throw new Error(e)
        }
        res.data.token = token
        console.log(res);
        return res

    }
}

exports.users = Users