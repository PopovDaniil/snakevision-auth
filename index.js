const fastify = require('fastify').fastify()
const postgres = require('postgres')

const db = postgres({
    host: process.env.AUTH_DB_HOST,
    username: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
});

// (async () => {
//     const res = await db`select * from users`
//     console.log(res)
// })()

fastify
.get("/", (req, res) => {
    res.send("Hello")
})
.listen(process.env.AUTH_PORT, '0.0.0.0')