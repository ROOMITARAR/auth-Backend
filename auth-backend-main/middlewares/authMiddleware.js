const jwt = require('jsonwebtoken')
const User = require('../models/User')

const checkUserAuth = async (req, res, next) =>{
    let token
    const {authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try {
            // Get token from Header
            token = authorization.split(' ')[1]

            // Verify token
            const {userID} = jwt.verify(token, process.env.SECRET_KEY)
            // Get user from Token
            req.user = await User.findById(userID).select('-password')
            console.log(req.user);
            next()
        } catch (error) {
            console.log(error);
            res.status(400).send({"Status": "Failed", "Message": "Unauthorized User or Invalid Token"})    
        }
    }
    else{
        res.status(400).send({"Status": "Failed", "Message": "Unauthorized User, No Token"})
    }
}

module.exports = checkUserAuth