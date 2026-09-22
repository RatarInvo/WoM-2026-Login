const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')  // object destructuring
//const authorize = require('../middleware/authorize')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

//router.use(authorize)

router.get('/', async (req, res) => {
    const users = await prisma.users.findMany({
        orderBy: { id: 'asc' }
    })
    res.send(users)
})

router.get('/:id', async (req, res) => {
    const user = await prisma.users.findUnique({
        where: { id: (req.params.id) }
    })
    if (!user) {
        return res.status(404).json({ msg: "User not found" })
    }
    res.send(user)
})

router.post('/', async (req, res) => {

    const dbUser = await prisma.users.findUnique({
        where: { username: req.body.username }
    })
    if (!dbUser) {
        console.log(`User ${req.body.username} not found`)
        return res.status(401).json({ msg: "Authentication failed" })
    }

    const isMatch = await bcrypt.compare(req.body.password_hash, dbUser.password_hash)
    if (!isMatch) {
        console.log(`Invalid password for user ${req.body.username}`)
        return res.status(401).json({ msg: "Authentication failed" })
    }

    const token = jwt.sign(
        { sub: dbUser.id, name: dbUser.username, role: dbUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    )
    
    res.send({
        msg: "Login successful", 
        id: dbUser.id,
        token: token
    })
})

router.put('/:id', async (req, res) => {
    console.log(`PATCH ${req.params.id}`)

    const note = await prisma.users.update({
        data: { note: req.body.note, updated_at: new Date() },
        where: { id: Number(req.params.id) }
    })

    res.send({
        msg: "Note updated", 
        id: note.id,
        updatedNote: note
    })
})

router.delete('/:id', async (req, res) => {

    const note = await prisma.users.delete({
        where: { id: Number(req.params.id) }
    })

    res.send({
        msg: "Note deleted", 
        id: note.id
    })
})


module.exports = router