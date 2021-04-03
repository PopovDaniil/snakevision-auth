const fastify = require('fastify')
/**
 * 
 * @returns {import('fastify').Fastify}
 */
function authApp() {
    /**
     * @type {import('fastify').FastifyInstance}
     */
    const server = fastify()
    const users = require('./users').users

    const headersSchema = {
        type: 'object',
        properties: {
            "Auth-Token": { type: 'string', minLength: 32 }
        },
        required: ['Auth-Token']
    }

    const setCORS = async (request, reply) => {
        reply.header("Access-Control-Allow-Origin", '*')
    }

    server
        .addHook('onSend', setCORS)
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
                const status = await users.reg(request.body)
                reply.send(status.toJSON())
            }
        )
        .post('/login', {
            schema: {
                headers: headersSchema,
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
                            info: { type: 'string' }
                        },
                        minProperties: 1
                    },
                }
            }
        },
            async (request, reply) => {
                const status = await users.login({
                    ...request.body,
                    ...request.headers
                })
                reply.headers(status.headers)
                reply.send(status.toJSON())
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
                const status = await users.logout(request.headers)
                reply.send(status.toJSON())
            })
    return server
}
module.exports = authApp