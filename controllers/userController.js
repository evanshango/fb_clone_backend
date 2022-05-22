const UserController = require('../models/userModel')

exports.fetchCurrentUser = async (req, res) => {
    try {
        const {user} = req
        const existing = await UserController.findById(user.id)
        if (!existing) return res.status(404).json({message: 'Auth not found'})

        const {_id, firstName, lastName, username, verified, picture, email} = existing

        return res.status(200).json({
            id: _id, firstName, lastName, username, verified, picture, email
        })
    } catch (e) {
        return res.status(500).json({
            message: 'An error occurred while trying to fetch user...'
        })
    }
}

exports.fetchUserByEmail = async (req, res) => {
    try {
        const {email} = req.query

        if (!email) return

        const existing = await UserController.findOne({email})
        if (!existing) return res.status(404).json({message: 'Account with that email not found'})
        return res.status(200).json({
            email: existing['email'],
            picture: existing['picture']
        })
    } catch (e) {
        return res.status(500).json({
            message: 'An error occurred while trying to find user'
        })
    }
}
