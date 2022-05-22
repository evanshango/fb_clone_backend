const express = require('express')
const {currentUser} = require("../middlewares/auth")
const {uploadFiles} = require("../controllers/uploadController")
const fileUpload = require('../middlewares/fileUpload')

const router = express.Router()

router
    .post('/uploads', currentUser, fileUpload, uploadFiles)

module.exports = router
