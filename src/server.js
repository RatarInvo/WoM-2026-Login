const express = require('express')
const cors = require('cors')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ msg: "login API", version: "0.1" })
})

const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')

app.use('/login', loginRouter)
app.use('/register', registerRouter)

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`)
})