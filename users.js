const jwt = require('jsonwebtoken')

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


class Users {
    /**
     * 
     * @param {Function} db 
     */
    constructor(db) {
        this.db = db;
    }
    secret = "SnakEe@JS"

    /**
     * Добавляет нового пользователя
     * @param {Object} opts
     * @returns {Status}
     * @throws {Error}
     */
    async reg(opts) {
        const { name, login, age, email, telephone, password } = opts
        let res = new Status()

        let token = jwt.sign({ login, password }, this.secret, { expiresIn: "90d" })

        try {
            const user = await this.db`
            INSERT INTO users (name, login, age, email, telephone, password, token)
            VALUES (${name},${login},${age},${email},${telephone},md5(${password}),${token})
            RETURNING login, email, telephone, token`

            res.data = user[0]
            res.info = "User successfully registered"
        } catch (e) {
            // Код ошибки при добавлении не уникального значения 
            if (e.code = '23505') {
                res.error = "Login, email or telephone is already in use"
            }
            else throw new Error(e)
        }

        // await sql.end()
        return res
    }

    async login(opts) {
        const { login, password } = opts
        let res = new Status()

        const user = await this.db`
            SELECT id FROM users 
            WHERE login = ${login} 
            AND password = md5(${password})`
            .catch(e => { throw new Error(e) })
        if (!user.count) {
            res.error = "Login or password is not correct"
            return res;
        }
        const userId = user[0].id
       
        const token = jwt.sign({ userId }, this.secret, { expiresIn: "90d" })

        await this.db`UPDATE users SET token = ${token} WHERE id = ${userId}`

        res.info = "User successfully logged in"
        res.data.token = token

        // await sql.end()
        return res

    }
    async logout(opts) {
        const token = opts['auth-token']
        let res = new Status()

        const tokenData = jwt.verify(token, secret)
        console.log(tokenData)
        if (!tokenData.userId) {
            res.error = "Token does not contain userId"
            return res
        }
        await this.db`UPDATE users SET token = NULL WHERE id = ${tokenData.userId}`

        res.info = "User successfully logged out"

        // await sql.end()
        return res
    }
}

module.exports = Users
