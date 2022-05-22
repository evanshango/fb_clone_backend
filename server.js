const express = require("express")
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const {readdirSync} = require('fs')
const {dbState} = require("./helpers/utils")
require('dotenv').config()

const app = express()
app.use(express.json())

//db config from env
const environment = () => {
    const envProps = {}
    const env = process.env.NODE_ENV
    if (env === 'production') {
        const MONGO_URI = process.env.MONGO_URI_PROD
        const DB_PASSWORD = process.env.DB_PASSWORD
        const DB = process.env.DB
        let dbURL = MONGO_URI
        dbURL = dbURL.replace('<password>', DB_PASSWORD)
        dbURL = dbURL.replace('<database>', DB)
        envProps.dbConn = dbURL
        envProps.currentEnv = 'Production'
    } else {
        envProps.dbConn = process.env.MONGO_URI_DEV
        envProps.currentEnv = 'Development'
    }
    return envProps
}

let allowedOrigins = process.env.ORIGINS.split(',')

const options = (req, res) => {
    let tmp, origin = req.header('Origin')
    if (allowedOrigins.indexOf(origin) > -1) tmp = {origin: true, optionsSuccessStatus: 200}
    else tmp = {origin: false}
    return res(null, tmp)
}

app.use(cors(options))
app.use(fileUpload())
//routes
readdirSync("./routes").map((r) => app.use('/api/v1', require(`./routes/${r}`)))

mongoose.connect(environment().dbConn).then(value => {
    const state = Number(value.connection.readyState)
    console.log(dbState.find(f => f.value === state).label, `${environment().currentEnv} Database`)
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
        console.log(`Server is running on Port ${PORT}...`)
    })
}).catch(error => {
    console.log(error)
})
