const {randomBytes, scryptSync} = require('crypto')
const jwt = require('jsonwebtoken')

exports.encryptPassword = async (password) => {
    const salt = randomBytes(12).toString('hex')
    const buf = await scryptSync(password, salt, 64)

    return `${buf.toString('hex')}.${salt}`
}

exports.decryptPassword = async (storedPass, suppliedPass) => {
    const [hashedPass, salt] = storedPass.split('.')
    const buf = await scryptSync(suppliedPass, salt, 64)

    return buf.toString('hex') === hashedPass
}

exports.userInformation = (model) => {
    const {...obj} = model
    const {password, __v, ...rest} = obj._doc
    return rest
}

exports.generateToken = (payload, expiry) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: expiry
    })
}

exports.dbState = [{
    value: 0, label: "Disconnected from"
}, {
    value: 1, label: "Connected to"
}, {
    value: 2, label: "Connecting to"
}, {
    value: 3, label: "Disconnecting from"
}]
