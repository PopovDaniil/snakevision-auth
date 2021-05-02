const Postgres = require('postgres');
const t = require('tap')
const authApp = require('../app')

t.test('App working', async t => {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    const app = authApp()
    const res = await app.inject({
        method: 'GET',
        url: '/'
    })
    t.equal(res.statusCode,200,'returns code 200')
    t.equal(res.body,"Hello","'Hello' string received")
    t.equal(res.headers["access-control-allow-origin"],"*", "CORS origin is set to *")
})