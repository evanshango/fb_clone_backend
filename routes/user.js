const express = require('express')
const {fetchCurrentUser, fetchUserByEmail} = require("../controllers/user")
const {currentUser} = require("../middlewares/auth")

const router = express.Router()

router
    .get('/users', fetchUserByEmail)
    .get('/users/current', currentUser, fetchCurrentUser)

module.exports = router
