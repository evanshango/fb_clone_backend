const express = require('express')
const {currentUser} = require("../middlewares/auth")
const {createPost} = require("../controllers/postController")

const router = express.Router()

router
    .post('/posts', currentUser, createPost)

module.exports = router
