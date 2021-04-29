const Postgres = require('postgres');
const sql = Postgres({
    host: process.env.AUTH_DB_HOST,
    username: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
});
const t = require('tap')
const authApp = require('../app')

const user = {
    name: "Ivan",
    login: "snake",
    password: "vision",
    age: 30,
    email: "ivan@gmail.com",
    telephone: 88005553535
};

t.test('User registration', async t => {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    const app = authApp()
    const res = await app.inject({
        method: 'POST',
        url: '/reg',
        payload: user
    }).catch(e => console.error(e))
    const body = await res.json()

    t.strictEqual(res.statusCode, 200, 'returns code 200')
    t.notMatch(body, { error: '' })
    t.match(body, { info: "User successfully registered", data: {} })

    t.tearDown(() => {
        app.close()
    })
})

t.test('User login', async t => {
    /**
    * @type {import('fastify').FastifyInstance}
    */
    const app = authApp()
    const res = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
            login: user.login,
            password: user.password
        }
    })
    const body = await res.json()
    console.log(body);
    t.strictEqual(res.statusCode, 200, 'returns code 200')
    t.strictEqual()


    t.tearDown(async () => {
        await sql`DELETE FROM users WHERE login=${user.login}`
        await sql.end()
        app.close()
    })
})
