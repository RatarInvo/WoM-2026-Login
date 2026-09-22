const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            msg: 'Authorization token missing'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)

        req.authUser = user
        next()
    } catch (error) {
        return res.status(401).json({
            msg: 'Authorization failed'
        })
    }
}