const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client') 

const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany({
        orderBy: {id: 'asc'}
    })
    res.send(users)
})

router.post('/', (req, res) => {
    console.log(req.body)
    // TEMP, ersätts med DB
    tempData.push(req.body)
    res.send({
        msg: "Note created", 
        id: tempData.length
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