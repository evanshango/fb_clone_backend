const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {validEmail, validLength, validUsername} = require("../helpers/validation")
const {encryptPassword, userInformation, generateToken, decryptPassword} = require("../helpers/utils")
const {sendVerificationEmail} = require("../helpers/mailer")

const userInfo = async (user, res, message) => {
    const token = generateToken({id: user._id.toString()}, "7d")

    const {_id, username, firstName, lastName, picture, verified} = user

    return res.status(201).json({
        message, user: {
            id: _id, firstName, lastName, username, verified, picture, token
        },
    })
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

        sendVerificationEmail(savedUser.email, savedUser.firstName, url)

        return userInfo(
            savedUser, res, 'Registration Successful. Please activate your account by clicking on the activation link sent on your email'
        )

    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.signin = async (req, res) => {
    try {
        const {email, password} = req.body
        const existing = await User.findOne({email})
        if (!existing) return res.status(404).json({
            status: 'Not found',
            message: 'Looks like the email address entered is not connected to an account...'
        })
        const validPass = await decryptPassword(existing['password'], password)
        if (!validPass) return res.status(401).json({
            status: 'Unauthorized',
            message: 'Invalid credentials. Please try again...'
        })
        return userInfo(existing, res, 'Signin success..')
    } catch (e) {
        return res.status(400).json({
            status: 'Bad request',
            message: 'An error occurred while trying to authenticate. Please try again...'
        })
    }
}

exports.activateAccount = async (req, res) => {
    const {token} = req.body
    try {
        const {id} = jwt.verify(token, process.env.TOKEN_SECRET)
        const existing = await User.findById(id)
        if (existing && existing['verified'] === true) {
            return res.status(200).json({
                status: 'Success',
                message: 'Email already activated...'
            })
        } else if (existing && existing['verified'] === false) {
            await User.findByIdAndUpdate(id, {verified: true})
            return res.status(200).json({
                status: 'Success',
                message: 'Account activated successfully...'
            })
        } else {
            return res.status(404).json({
                status: 'Not found',
                message: 'Account does not exist'
            })
        }
    } catch (e) {
        return res.status(400).json({
            status: 'Bad request',
            message: 'Invalid or expired token'
        })
    }
}
