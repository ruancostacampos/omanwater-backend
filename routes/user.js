const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateToken = require('../middlewares/authenticate-jwt')

const expireSessionTokenTime = '30s'
const expireRefreshTokenTime = '2m'

// Register User
router.post('/register', async(req, res) => {

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
    const user = new User({name, email, password: passwordHash, super: true})

    try{
        
        await user.save()
        res.status(201).json({message: "User sucessful created."})

    }catch(err){

        console.log(err)
        res.status(500).json({message: 'Request problem, try again later.'})

    }
})

//Login user
router.post('/login', async (req, res) => {
    
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
        
       const secret = process.env.TOKEN_SECRET
       const refreshSecret = process.env.REFRESH_SECRET

       const token = jwt.sign({
         id: user._id,
         super: user.super
       }, secret, {expiresIn: expireSessionTokenTime})

       const refreshToken = jwt.sign({
        id: user._id,
        super: user.super
      }, refreshSecret, {expiresIn: expireRefreshTokenTime})

       res.status(200).json({message: 'Sucessful', token, refreshToken})

    }catch(err){

        console.log(err)
        res.status(500).json({message: 'Request problem, try again later.'})

    }

})

router.post('/refresh', (req, res) => {

    const refreshToken = req.body.refreshToken
    
    if(!refreshToken) return res.status(401).json({message: "Session problem."}) 

    refreshSecret = process.env.REFRESH_SECRET
    tokenSecret = process.env.TOKEN_SECRET

    jwt.verify(refreshToken, refreshSecret, (err, user) => {
        
        if(err) return res.status(403).json({message: "Error while refreshing your token."})

        const token = jwt.sign({id: user.id, super: user.super}, tokenSecret, {expiresIn: expireSessionTokenTime})
        return res.status(201).json({message: "Token refreshed.", token})
        
    })

})

router.get('/private', authenticateToken, (req, res) => {
    return res.status(200).json(
        {
            message: "Protected route acessed, you're logged in!",
            test: "You're running a test endpoint.",
            uid: req.uid,
            super: `${req.super}`
        }
    )
})

module.exports = router