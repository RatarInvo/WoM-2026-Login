const express = require('express')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 3000

console.log(`Node.js ${process.version}`)
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ msg: "login API", version: "0.1" })
})

const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
app.use('/login', loginRouter)
app.use('/register', registerRouter)



app.listen(PORT, () => {
    try {
        console.log(`Running on http://localhost:${PORT}`)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    
})
