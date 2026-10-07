const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client') 
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    const users = await prisma.users.findMany({
        orderBy: {id: 'asc'}
    })
    res.send(users)
})

router.post('/', async (req, res) => {
    if (!req.body?.username || !req.body?.password_hash || !req.body?.email) {
        return res.status(400).json({ msg: "Username, email and password are required" })
    }

    const password_hash = await bcrypt.hash(req.body.password_hash, 10)

    let register
    try {
        register = await prisma.users.create({
            data: {
                username: req.body.username,
                password_hash: password_hash,
                role: req.body.role,
                email: req.body.email
            }
        })
    } catch (error) {
        // username already exists
        if (error.code === 'P2002') {
            return res.status(409).json({ msg: "That username is already taken" })
        }
        throw error
    }

    res.send({
        msg: "user created", 
        id: register.id
    })
})

router.put('/:id', (req, res) => {
    console.log(`PATCH ${req.params.id}`)
    // TEMP, ersätts med DB
    tempData[req.params.id-1] = req.body
    res.send({
        msg: "Note updated", 
        id: req.params.id,
        newNote: tempData[req.params.id-1]
    })
})

router.delete('/:id', (req, res) => {
    // TEMP, ersätts med DB
    tempData.splice(req.params.id-1)

    res.send({
        msg: "Note deleted", 
        id: req.params.id
    })
})

module.exports = router