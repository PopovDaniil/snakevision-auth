const authApp = require('./app')

authApp({
    logger: {
        level: 'info',
        prettyPrint: true
    }
})
.listen(process.env.AUTH_PORT, '0.0.0.0')
