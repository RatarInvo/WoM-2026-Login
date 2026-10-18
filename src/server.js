const express = require('express')
const cors = require('cors')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 3000

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5500')

if (allowedOrigins.length === 0) {
    throw new Error('CLIENT_ORIGIN is missing')
}

app.use(cors({
    origin: allowedOrigins
}))

app.use(express.json())


app.use('/', express.static(__dirname + '/static'))

app.get('/health', (req, res) => {
    res.json({ msg: "login API", version: "0.1" })
})

const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
const passwordRouter = require('./routes/password')
const refreshRouter = require('./routes/refresh.js')

app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/password', passwordRouter)
app.use('/refresh', refreshRouter)

app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ msg: 'Invalid JSON in request body' })
    }

    console.error(`${req.method} ${req.originalUrl} failed:`, error)
    res.status(500).json({ msg: 'Something went wrong on the server. Please try again.' })
})

app.listen(PORT, () => {
    console.log(`Running on ${PORT}`)
})