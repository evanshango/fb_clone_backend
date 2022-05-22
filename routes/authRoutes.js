const express = require('express')
const {currentUser} = require("../middlewares/auth")
const {signup, signin, activateAccount, changePassword} = require("../controllers/authController")

const router = express.Router()

router
    .post('/auth/signup', signup)
    .post('/auth/signin', signin)
    .post('/auth/activate', currentUser, activateAccount)
    .post('/auth/password', changePassword)

module.exports = router
