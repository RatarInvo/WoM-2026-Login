const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')  // object destructuring

const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    const login = await prisma.users.findMany({
        orderBy: { id: 'asc' }
    })
    res.send(login)
})

router.post('/', async (req, res) => {
    console.log(req.body)
    
    const note = await prisma.users.create({
        data: { 
            author_id: 1, // from JWT later
            note: req.body.note 
        }
    })
    
    res.send({
        msg: "Note created", 
        id: note.id
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