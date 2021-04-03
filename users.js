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
    async reg(opts) {
        const { name, login, age, email, telephone, password } = opts
        let res = new Status()

        let token = jwt.sign({ login, password }, secret, { expiresIn: "90d" })

        try {
            const user = await sql`
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


        return res
    },

    async login(opts) {
        const { login, password } = opts
        let token = opts['auth-token']

        let res = new Status()
        const tokenData = jwt.verify(token, secret)
        console.log(tokenData);

        const user = await sql`
            SELECT id FROM users 
            WHERE login = ${login} 
            AND password = md5(${password})`
            .catch(e => { throw new Error(e) })
        if (!user.count || login != tokenData.login || password != tokenData.password) {
            res.error = "Login or password is not correct"
            return res;
        }
        const userId = user[0].id
        token = jwt.sign({ userId }, secret, { expiresIn: "1h" })

        await sql`UPDATE users SET token = ${token} WHERE id = ${userId}`

        res.info = "User successfully logged in"
        res.headers['auth-token'] = token
        return res

    },
    async logout(opts) {
        const token = opts['auth-token']
        let res = new Status()

        const tokenData = jwt.verify(token, secret)
        console.log(tokenData)
        if (!tokenData.userId) {
            res.error = "Token does not contain userId"
            return res
        }
        await sql`UPDATE users SET token = NULL WHERE id = ${tokenData.userId}`

        res.info = "User successfully logged out"
        return res
    }
}

exports.users = Users