// routes/routes.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const stuser = require('../models/stuser');

const router = Router();

router.post('/register', async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password,salt); 



    const record = await User.findOne({
        email:email
    })
    if (record){
        return res.status(400).send({
            message:"email is already registered "
        })
    }
    else{

    const user = new User({
        name: name,
        email: email,
        password:hashedPassword
    })

   

    const result = await user.save()

//    jwttoken

   const {_id} =await result.toJSON()

   const token = jwt.sign({_id:_id}, process.env.JWT_SECRET, { expiresIn: '1d' })

   res.cookie("jwt",token,{
    httpOnly:true,
    secure: true,
    sameSite: 'none',
    maxAge:24*60*60*1000
   })

    res.send({
     message:"success"
    })
}

});

// ...................

router.post('/login', async (req, res) => {
    const user = await User.findOne({email:req.body.email})
    if(!user){
       return res.status(401).send({
        message: "Invalid email or password"
       })     
    }

    if(!(await bcrypt.compare(req.body.password,user.password))){
        return res.status(401).send({
            message: "Invalid email or password"
           }) 
    }

   const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, { expiresIn: '1d' })

res.cookie('jwt', token, {
    httpOnly:true,
    secure: true,
    sameSite: 'none',
    maxAge:24*60*60*1000
})
res.send({
    message:"success"
})


});

router.get('/user', async (req, res) => {
   try{

    const cookie= req.cookies['jwt']

    const claims = jwt.verify(cookie, process.env.JWT_SECRET)

    if(!claims){
        return res.status(401).send({
            message: "unauthenticated"
        })
    }   

        const user = await User.findOne({_id:claims._id})

        const {password,...data} = await user.toJSON()
        res.send(data)
    
    }

   catch(err){
         return res.status(401).send({
            message: 'unauthenticate'
         })
   }
}
);

//////////////////////////////alluser///////////


// routes/routes.js
router.get('/allUsers', async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];
        if (!cookie) {
            return res.status(401).send({ message: "Unauthenticated" });
        }
        const claims = jwt.verify(cookie, process.env.JWT_SECRET);
        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        // Fetch all users without sensitive information
        const users = await User.find({}, { password: 0 });

        // Return the list of users without sensitive information
        res.send(users);

    } catch (err) {
        return res.status(500).send({
            message: 'Internal server error'
        });
    }
});
 
 
 /////////////////////////////////////////////////
 

router.post('/logout', (req , res) =>{
    res.cookie("jwt" , "" , {maxAge:0, secure: true, sameSite: 'none'})

    res.send({
        message:"logout success"
    })
} )

module.exports = router;
