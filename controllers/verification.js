const User = require('../models/userModel')
const Code = require("../models/codeModel")
const {generateToken, generateCode} = require("../helpers/utils")
const {sendVerificationEmail, sendResetCode} = require("../helpers/mailer")

exports.verificationLink = async (req, res) => {
    const {id} = req.user
    try {
        const existing = await User.findById(id)
        if (!existing) return res.status(404).json({message: 'Auth not found'})

        if (existing['verified'] === true) return res.status(200).json({message: 'Account already activated...'})

        const token = generateToken({id: existing['_id'].toString()}, '30m')

        const url = `${process.env.CLIENT_BASE_URL}/activate/${token}`

        await sendVerificationEmail(existing['email'], existing['firstName'], url)
        return res.status(200).json({message: 'Account verification link has been sent to your email'})
    } catch (e) {
        return res.status(500).json({
            message: 'An error occurred while requesting activation link'
        })
    }
}

exports.verificationCode = async (req, res) => {
    try {
        const {email} = req.body
        if (!email) return

        const existing = await User.findOne({email})
        if (!existing) return res.status(404).json({message: 'Auth not found'})

        await Code.findOneAndRemove({user: existing['_id']})

        const code = generateCode(5)
        const savedCode = await new Code({code, user: existing['_id']})

        await savedCode.save()

        await sendResetCode(existing['email'], existing['firstName'], savedCode.code)
        return res.status(200).json({message: 'Success. Email reset code has been sent to your email'})
    } catch (e) {
        return res.status(500).json({
            message: 'An error occurred while requesting verification code'
        })
    }
}

exports.validateResetCode = async (req, res) => {
    try {
        const {email, code} = req.body
        const existing = await User.findOne({email})
        if (!existing) return res.status(404).json({message: 'User not found'})

        const existingCode = await Code.findOne({user: existing['_id']})

        if (!existingCode || existingCode['code'] !== +code)
            return res.status(400).json({message: 'Invalid verification code'})

        return res.status(200).json({message: 'Code verified successfully'})

    } catch (e) {
        return res.status(500).json({
            message: 'An error occurred while validating reset code'
        })
    }
}
