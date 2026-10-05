const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

// Credits for mailing: https://nodemailer.com/

const prisma = new PrismaClient()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: false
})

function resetSecret(user) {
    return process.env.JWT_SECRET + user.password_hash
}

router.post('/forgot', async (req, res) => {
    const email = (req.body.email || '').trim()
    const genericReply = { msg: "If an account exists for that email, a reset link is on its way." }

    if (!email) {
        return res.status(400).json({ msg: "Email is required" })
    }

    const users = await prisma.users.findMany({
        where: { email: { equals: email, mode: 'insensitive' } }
    })

    for (const user of users) {
        const token = jwt.sign(
            { sub: user.id, purpose: 'password_reset' },
            resetSecret(user),
            { expiresIn: '15m' }
        )
        const link = `${FRONTEND_URL}/reset.html?token=${encodeURIComponent(token)}`

        console.log(`Password reset link for ${user.username}: ${link}`)

        try {
            await transporter.sendMail({
                from: '"WoM Notes" <no-reply@wom.local>',
                to: user.email,
                subject: 'Reset your password',
                text: `Hi ${user.username},\n\nReset your password here (valid for 15 minutes):\n${link}\n\nIf you didn't ask for this, ignore this mail.`,
                html: `<p>Hi <b>${user.username}</b>,</p>
                       <p>Click the link below to reset your password. It is valid for 15 minutes.</p>
                       <p><a href="${link}">Reset password</a></p>
                       <p>If you didn't ask for this, ignore this mail.</p>`
            })
        } catch (error) {
            console.log(`Could not send reset mail: ${error.message}`)
        }
    }

    res.send(genericReply)
})

router.post('/reset', async (req, res) => {
    const { token, password } = req.body

    if (!token || !password) {
        return res.status(400).json({ msg: "Token and password are required" })
    }

    if (password.length < 8) {
        return res.status(400).json({ msg: "Password must be at least 8 characters" })
    }

    const decoded = jwt.decode(token)
    if (!decoded || decoded.purpose !== 'password_reset') {
        return res.status(400).json({ msg: "Invalid or expired reset link" })
    }

    const user = await prisma.users.findUnique({
        where: { id: decoded.sub }
    })
    if (!user) {
        return res.status(400).json({ msg: "Invalid or expired reset link" })
    }

    try {
        jwt.verify(token, resetSecret(user))
    } catch (error) {
        return res.status(400).json({ msg: "Invalid or expired reset link" })
    }

    const password_hash = await bcrypt.hash(password, 10)
    await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: password_hash, updated_at: new Date() }
    })

    res.send({ msg: "Password updated" })
})

module.exports = router