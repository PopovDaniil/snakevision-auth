const fastify = require('fastify')
const postgres = require('postgres')

/**
 * 
 * @returns {import('fastify').Fastify}
 */
function authApp() {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    const server = fastify()
    const Users = require('./users')

    const sql = postgres({
        host: process.env.AUTH_DB_HOST,
        username: process.env.AUTH_DB_USER,
        password: process.env.AUTH_DB_PASSWORD
    });

    const headersSchema = {
        type: 'object',
        properties: {
            "Auth-Token": { type: 'string', minLength: 32 }
        },
        required: ['Auth-Token']
    }



    server
        .register(require('fastify-cors'), {})
        .decorate('db', sql)
        .decorate('users', new Users(server.db), ['db'])
        .addHook('onClose', async () => await server.db.end())

        .get("/", (request, reply) => {
            reply.send("Hello")
        })
        .post("/reg",
            {
                schema: {
                    body: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            login: { type: 'string' },
                            age: { type: 'number' },
                            email: { type: 'string' },
                            telephone: { type: 'number' },
                            password: { type: 'string' }
                        },
                        required: ['name', 'login', 'age', 'email', 'telephone', 'password']
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        login: { type: 'string' },
                                        email: { type: 'string' },
                                        telephone: { type: 'number' },
                                        token: { type: 'string' }
                                    },
                                    required: ['login', 'email', 'telephone', 'token']
                                },
                                error: { type: 'string' },
                                info: { type: 'string' }
                            }
                        }
                    }
                }
            },
            async (request, reply) => {
                const status = await server.users.reg(request.body)
                reply.send(status.toJSON())
            }
        )
        .post('/login', {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        login: { type: 'string' },
                        password: { type: 'string' }
                    },
                    required: ['login', 'password']
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                            info: { type: 'string' },
                            data: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' }
                                }
                            }
                        },
                        minProperties: 1
                    },
                }
            }
        },
            async (request, reply) => {
                const status = await server.users.login({
                    ...request.body
                })
                reply.headers(status.headers)
                reply.send(status.toJSON())
                console.log(status.toJSON())
            })
        .post("/logout", {
            schema: {
                headers: headersSchema,
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                            info: { type: 'string' }
                        },
                        minProperties: 1
                    }
                }
            }
        },
            async (request, reply) => {
                const status = await server.users.logout(request.headers)
                reply.send(status.toJSON())
            })
    return server
}
module.exports = authApp
