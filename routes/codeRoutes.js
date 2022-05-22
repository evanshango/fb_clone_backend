const express = require('express')
const {verificationCode, verificationLink, validateResetCode} = require("../controllers/verificationController")
const {currentUser} = require("../middlewares/auth")

const router = express.Router()

router
    .post('/verifications/code', verificationCode)
    .post('/verifications/validate', validateResetCode)
    .get('/verifications/link', currentUser, verificationLink)

module.exports = router
