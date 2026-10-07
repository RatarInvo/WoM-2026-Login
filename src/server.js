const express = require('express')
const cors = require('cors')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/', express.static(__dirname + '/static'))

app.get('/health', (req, res) => {
    res.json({ msg: "login API", version: "0.1" })
})

const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
const passwordRouter = require('./routes/password')

app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/password', passwordRouter)

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