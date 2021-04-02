const postgres = require('postgres')
const jwt = require('jsonwebtoken')

const secret = "SnakEe@JS"

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
    /** @type {Object<string,string>}*/
    headers = {};
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
        let token = jwt.sign({ userId }, secret, {expiresIn: "1h"})
        
        res.info = "User successfully logged in"
        res.headers['auth-token'] = token
        return res

    },
    async logout(opts) {
        const { token } = opts;
        let res = new Status()

        res.info = "User successfully logged out"
        return res
    }
}

exports.users = Users