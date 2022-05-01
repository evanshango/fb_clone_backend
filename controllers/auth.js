const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {validEmail, validLength, validUsername} = require("../helpers/validation")
const {encryptPassword, userInformation, generateToken, decryptPassword} = require("../helpers/utils")
const {sendVerificationEmail} = require("../helpers/mailer")

const authInfo = async (user, res, status, message) => {
    const token = generateToken({id: user._id.toString()}, "7d")
    return res.status(status).json({message, token})
}

exports.signup = async (req, res) => {
    try {
        const {firstName, lastName, email, bYear, bMonth, bDay, gender, password} = req.body

        if (!validLength(firstName, 3, 30))
            return res.status(400).json({message: 'Firstname must be between 3 and 30 characters long'})

        if (!validLength(lastName, 3, 30))
            return res.status(400).json({message: 'Lastname must be between 3 and 30 characters long'})

        if (!validEmail(email)) return res.status(400).json({message: 'Invalid email address'})

        const emailCheck = await User.findOne({email})

        if (emailCheck) return res.status(400).json({message: 'Email already taken. Try again with a different one'})

        if (!validLength(password, 6, 30))
            return res.status(400).json({message: 'Password must be at least 6  characters long'})

        const encryptedPass = await encryptPassword(password)
        const username = await validUsername(lastName)
        const newUser = await new User({
            firstName, lastName, username, email, bYear, bMonth, bDay, gender, password: encryptedPass
        })
        const savedUser = userInformation(await newUser.save())

        //email verification token
        const emailVerificationToken = generateToken({id: savedUser._id.toString()}, '30m')

        const url = `${process.env.CLIENT_BASE_URL}/activate/${emailVerificationToken}`

        await sendVerificationEmail(savedUser.email, savedUser.firstName, url)

        return authInfo(savedUser, res, 201, "Account created successfully")
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.signin = async (req, res) => {
    try {
        const {email, password} = req.body
        const existing = await User.findOne({email})
        if (!existing) return res.status(404).json({
            message: 'Looks like the email address entered is not connected to an account...'
        })
        const validPass = await decryptPassword(existing['password'], password)
        if (!validPass) return res.status(401).json({
            message: 'Invalid credentials. Please try again...'
        })
        return authInfo(existing, res, 200, 'Signed in successfully')
    } catch (e) {
        return res.status(400).json({
            message: 'An error occurred while trying to authenticate. Please try again...'
        })
    }
}

exports.activateAccount = async (req, res) => {
    const {token} = req.body
    try {
        const {id} = jwt.verify(token, process.env.TOKEN_SECRET)

        if (req.user.id !== id) return res.status(401).json({message: 'Unauthorized request'})

        const existing = await User.findById(id)
        if (existing && existing['verified'] === true) {
            return res.status(200).json({
                message: 'Account already activated...'
            })

        } else if (existing && existing['verified'] === false) {
            await User.findByIdAndUpdate(id, {verified: true})
            return res.status(200).json({
                message: 'Account activated successfully...'
            })
        } else {
            return res.status(404).json({
                message: 'Account does not exist'
            })
        }
    } catch (e) {
        return res.status(400).json({
            message: 'Invalid or expired token'
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const {email, password} = req.body

        const encryptedPass = await encryptPassword(password)

        const existing = await User.findOne({email})
        if (!existing) return res.status(404).json({message: 'User not found'})

        if (!validLength(password, 6, 30))
            return res.status(400).json({message: 'Password must be at least 6  characters long'})

        await User.findOneAndUpdate({email: existing['email']}, {password: encryptedPass})

        return res.status(200).json({message: 'Password reset successful'})
    } catch (e) {
        return res.status(500).json({message: 'An error occurred while updating user password'})
    }
}
