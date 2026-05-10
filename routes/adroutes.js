// routes/routes.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adUser = require('../models/admin');
// const aduser = require('../models/aduser');

const router = Router();

router.post('/adregister', async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password,salt); 



    const record = await adUser.findOne({
        email:email
    })
    if (record){
        return res.status(400).send({
            message:"email is already registered "
        })
    }
    else{

    const aduser = new adUser({
        name: name,
        email: email,
        password:hashedPassword
    })

   

    const result = await aduser.save()

//    jwttoken

   const {_id} =await result.toJSON()

   const token = jwt.sign({_id:_id}, process.env.JWT_SECRET, { expiresIn: '1d' })

   res.cookie("jwt",token,{
    httpOnly:true,
    secure:true,
    sameSite:'none',
    maxAge:24*60*60*1000
   })

    res.send({
     message:"success"
    })
}

});

// ...................

router.post('/adlogin', async (req, res) => {
    const aduser = await adUser.findOne({email:req.body.email})
    if(!aduser){
       return res.status(401).send({
        message: "Invalid email or password"
       })     
    }

    if(!(await bcrypt.compare(req.body.password,aduser.password))){
        return res.status(401).send({
            message: "Invalid email or password"
           }) 
    }

   const token = jwt.sign({_id:aduser._id}, process.env.JWT_SECRET, { expiresIn: '1d' })

res.cookie('jwt', token, {
    httpOnly:true,
    secure:true,
    sameSite:'none',
    maxAge:24*60*60*1000
})
res.send({
    message:"successfully login"
})


});

router.get('/aduser', async (req, res) => {
   try{

    const cookie= req.cookies['jwt']

    const claims = jwt.verify(cookie, process.env.JWT_SECRET)

    if(!claims){
        return res.status(401).send({
            message: "unauthenticated"
        })
    }   

        const aduser = await adUser.findOne({_id:claims._id})

        const {password,...data} = await aduser.toJSON()
        res.send(data)
    
    }

   catch(err){
         return res.status(401).send({
            message: 'unauthenticate'
         })
   }
}
);

router.post('/adlogout', (req , res) =>{
    res.cookie("jwt" , "" , {maxAge:0, secure:true, sameSite:'none'})

    res.send({
        message:"logout success"
    })
} )

module.exports = router;
