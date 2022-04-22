const express = require('express')
const {signup, activateAccount, signin} = require("../controllers/user")

const router = express.Router()

router
    .post('/auth/signup', signup)
    .post('/auth/signin', signin)
    .post('/auth/activate', activateAccount)

module.exports = router
