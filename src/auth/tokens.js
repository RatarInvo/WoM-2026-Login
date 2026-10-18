const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const ACCESS_TOKEN_LIFETIME = '15m'
const REFRESH_TOKEN_LIFETIME_DAYS = 30

function createAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            name: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_LIFETIME
        }
    )
}

function createRefreshToken() {
    return crypto.randomBytes(48).toString('hex')
}

function refreshTokenExpiration() {
    const expiresAt = new Date()
    expiresAt.setDate(
        expiresAt.getDate() + REFRESH_TOKEN_LIFETIME_DAYS
    )
    return expiresAt
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    refreshTokenExpiration
}