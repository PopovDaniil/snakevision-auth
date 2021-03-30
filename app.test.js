const { test } = require('tap')
const authApp = require('./app')

test('GET /', async t => {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    const app = authApp()
    const res = await app.inject({
        method: 'GET',
        url: '/'
    })
    t.strictEqual(res.statusCode,200,'returns code 200')
})