const authApp = require('./app')

authApp({
    logger: true
})
.listen(process.env.AUTH_PORT, '0.0.0.0')
