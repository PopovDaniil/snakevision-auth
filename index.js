const fastify = require('fastify').fastify()
const users = require('./users').users

const headersSchema = {
    type: 'object',
    properties: {
        "Auth-Token": { type: 'string' }
    },
    required: ['Auth-Token']
}

fastify
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
                            login: { type: 'string' },
                            email: { type: 'string' },
                            telephone: { type: 'number' },
                        },
                        required: ['login', 'email', 'telephone']
                    }
                }
            }
        },
        async (request, reply) => {
            const status = await users.add(request.body)
            reply.send(status[0])
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
                        token: { type: 'string' }
                    },
                    required: ['token']
                },
                401: {
                    type: 'string'
                }
            }
        }
    },
        async (request, reply) => {
            const status = await users.login(request.body)
            if (!status) {
                reply.code(401)
                reply.send("Authorization error")
            } else {
                reply.code(200)
                reply.send(status)
            }
        })
    .listen(process.env.AUTH_PORT, '0.0.0.0')