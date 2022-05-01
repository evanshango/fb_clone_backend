const jwt = require('jsonwebtoken')

exports.currentUser = async (req, res, next) => {
    try {
        let header = req.header('Authorization')
        let token = header ? header.split(" ")[1] : null
        if (!token) return res.status(401).json({message: 'Unauthorized request'})
        jwt.verify(token, process.env.TOKEN_SECRET, (err, res) => {
            if (err) return res.status(401).json({message: 'Invalid or expired token'})
            req.user = res
            next()
        })
    } catch (e) {
        return res.status(500).json({message: e?.message})
    }
}
