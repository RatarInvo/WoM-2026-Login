const express = require('express')
const { PrismaClient } = require('@prisma/client')

const {
    createAccessToken,
    refreshTokenExpiration
} = require('../auth/tokens')

const router = express.Router()
const prisma = new PrismaClient()

function getRefreshToken(req) {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return null
    }

    return authorization.substring('Bearer '.length).trim()
}

router.post('/', async (req, res) => {
    const token = getRefreshToken(req)

    if (!token) {
        return res.status(401).json({
            msg: 'Refresh token missing'
        })
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: {
            token
        },
        include: {
            user: true
        }
    })

    if (!storedToken) {
        return res.status(401).json({
            msg: 'Refresh token invalid'
        })
    }

    if (storedToken.expires_at <= new Date()) {
        await prisma.refreshToken.delete({
            where: {
                id: storedToken.id
            }
        })

        return res.status(401).json({
            msg: 'Refresh token expired'
        })
    }

    const accessToken = createAccessToken(storedToken.user)

    res.json({
        accessToken,
        expiresAt: refreshTokenExpiration()
    })
})

router.delete('/', async (req, res) => {
    const token = getRefreshToken(req)

    if (!token) {
        return res.status(204).end()
    }

    await prisma.refreshToken.deleteMany({
        where: {
            token
        }
    })

    res.status(204).end()
})

module.exports = router