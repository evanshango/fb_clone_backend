const User = require('../models/userModel')
exports.validEmail = (email) => String(email).toLowerCase().match(
    /^([a-z\d.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/
)

exports.validLength = (value, min, max) => !(value.length > max || value.length < min)

exports.validUsername = async (username) => {
    try {
        let a = false
        do {
            let checkUsername = await User.findOne({username: `@${username}`})
            if (checkUsername) {
                // change username
                username += (+new Date() * Math.random()).toString().substring(0, 1)
                a = true
            } else {
                a = false
            }
        } while (a)
    } catch (e) {
        console.log(e)
    }
    return `@${username}`
}
