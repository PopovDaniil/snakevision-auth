const { test } = require('tap')
const authApp = require('./app')

test('App working', async t => {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    const app = authApp()
    const res = await app.inject({
        method: 'GET',
        url: '/'
    })
    t.strictEqual(res.statusCode,200,'returns code 200')
    t.strictEqual(res.body,"Hello","'Hello' string received")
    t.strictEqual(res.headers["access-control-allow-origin"],"*", "CORS origin is set to *")
})