// Middleware for authenticate token
require('dotenv').config()
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET

function authenticateToken(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({message: "Access denied."})
    }

    let decodedToken;

    try{
        
        const secret = process.env.SECRET
        decodedToken = jwt.verify(token, secret)
        console.log(decodedToken.id)

    }catch(err){
        return res.status(400).json({message: "Expired token."})
    }

    req.uid = decodedToken.id
    req.super = decodedToken.super

    next()

}

module.exports = authenticateToken