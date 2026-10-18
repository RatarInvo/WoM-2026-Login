const express = require('express')
const cors = require('cors')

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000
const frontendOrigin = process.env.FRONTEND_URL || 'http://127.0.0.1:5500'

app.use(cors({
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/', express.static(__dirname + '/static'))

app.get('/health', (req, res) => {
    res.json({
        msg: 'login API',
        version: '0.1'
    })
})

const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
const passwordRouter = require('./routes/password')
const refreshRouter = require('./routes/refresh')

app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/password', passwordRouter)
app.use('/refresh', refreshRouter)

app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            msg: 'Invalid JSON in request body'
        })
    }

    console.error(`${req.method} ${req.originalUrl} failed:`, error)

    res.status(500).json({
        msg: 'Something went wrong on the server'
    })
})

app.listen(PORT, () => {
    console.log(`Login API running on http://localhost:${PORT}`)
})