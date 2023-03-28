// Middleware for authenticate token
require('dotenv').config()
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET

function isAdmin(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({message: "Access denied."})
    }

    let decodedToken;

    try{
        
        const secret = process.env.TOKEN_SECRET
        decodedToken = jwt.verify(token, secret)


        if(decodedToken.email !== process.env.ADMIN_EMAIL){
            return res.status(401).json({message: "Unauthorized."})
        }

    }catch(err){
        console.log(err)
        return res.status(400).json({message: "Expired token."})
    }

    req.uid = decodedToken.id
    req.super = decodedToken.super

    next()

}

module.exports = isAdmin