require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const user = require('./routes/user')
const app = express()

// Config JSON Response
app.use(express.json())

app.use('/auth', user)

//Models
const User = require('./models/User')

// Public Route
app.get('/', (req, res) => {

    res.status(200).json({msg: "API Working!"})

})


// Credentials
const dbUser = process.env.DB_USERNAME
const dbPass = process.env.DB_PASSWORD

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.5kce0j6.mongodb.net/?retryWrites=true&w=majority`).then( () => {
    app.listen(3000)
    console.log('Connected to database.')
}).catch( (err) => {
    console.log(err)
})