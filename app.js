require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// Config JSON Response
app.use(express.json())

//Models
const User = require('./models/User')

// Public Route
app.get('/', (req, res) => {

    res.status(200).json({msg: "API Working!"})

})

// Private Route
app.get('/user/:id', async (req, res) => {
    
    const id = req.params.id

    const user = await User.findById(id, '-password')

    if(!user){
        return res.status(404).json({message: 'User not found.'})
    }

    return res.status(200).json({user})

})

// Register User
app.post('/auth/register', async(req, res) => {

    const {name, email, password, confirmPassword} = req.body

    if(!name){
        return res.status(422).json({message: "The name is required!"})
    }
    
    if(!email){
        return res.status(422).json({message: "The email is required!"})
    }

    if(!password){
        return res.status(422).json({message: "The password is required!"})
    }

    if(password !== confirmPassword){
        return res.status(422).json({message: "The passwords don't match!"})
    }

    const userExists = await User.findOne({email})

    if(userExists){
        return res.status(422).json({message: "This email is already in use."})
    }

    //Create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Create user
    const user = new User({name, email, password: passwordHash})

    try{
        
        await user.save()
        res.status(201).json({message: "User sucessful created."})

    }catch(err){

        console.log(err)
        res.status(500).json({message: 'Request problem, try again later.'})

    }
})

//Login user
app.post('/auth/login', async (req, res) => {
    
    const {email, password} = req.body

    // Validations
    if(!email){
        return res.status(422).json({message: "The email is required!"})
    }

    if(!password){
        return res.status(422).json({message: "The password is required!"})
    }

    // Check if user exists
    const user = await User.findOne({email})

    if(!user){
        return res.status(404).json({message: 'Wrong password or user dont exist.'})
    }

    // Check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(422).json({})
    }

    try{
        
       const secret = process.env.SECRET

       const token = jwt.sign({
         id: user._id
       }, secret)

       res.status(200).json({message: 'Sucessful', token})

    }catch(err){

        console.log(err)
        res.status(500).json({message: 'Request problem, try again later.'})

    }

})

// Middleware for check token
function checkToken(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({message: "Acess denied."})
    }

    try{
        
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()

    }catch(err){
        res.status(400).json({message: "Invalid token."})
    }

}

// Credentials
const dbUser = process.env.DB_USERNAME
const dbPass = process.env.DB_PASSWORD

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.5kce0j6.mongodb.net/?retryWrites=true&w=majority`).then( () => {
    app.listen(3000)
    console.log('Connected to database.')
}).catch( (err) => {
    console.log(err)
})