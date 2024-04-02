const express = require('express');
const User  = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET;

//Creating an user with post request:"/api/auth/createUser" -- NO LOGIN REQUIRED -- ROUTE 1 
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 2 }),
    body('email', "Enter a valid Email").isEmail(),
    body('password', 'Password must have a minimum of 5 characters').isLength({ min: 5 }),
  ],async (req,res)=>{
    // if there are errors send bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    //Check if the email already exists or not
    try {
        let user = await User.findOne({email:req.body.email})
        let success = false;
    if (user) {
        res.status(400).send({success,error:"This email already exists!"})
    }
    //Create a new User
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password,salt);

    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePass
      })
      const data = {
        user:{
            id:user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_SECRET);
    //   res.send(user);
    //   req.body
    res.send({success:true,authtoken});
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error')
    }
      
    //   .then((user)=>{res.send(user)}).catch((error)=>{res.send({error:'Please enter an unique email'})})
    // console.log(req.body)

})

//Authenticating an user with post request:"/api/auth/login" -- NO LOGIN REQUIRED -- ROUTE 2
router.post('/login', [
    body('email', "Enter a valid Email").isEmail(),
    body('password', 'Password must not be blank').exists(),
  ],async (req,res)=>{
    // if there are errors send bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try {
        const{email,password} = req.body;
        let user = await User.findOne({email})
        let success = false;
        if (!user) {
            res.status(400).send({success,error:"Please try to login with correct credentials"}) 
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if (!passwordCompare) {
            res.status(400).send({success,error:"Please try to login with correct credentials"}) 
        }
        const data = {
            user:{
                id:user.id
            }
          }
          const authtoken = jwt.sign(data,JWT_SECRET);
          res.send({success:true,authtoken});
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error')
    }
  }
)

//Get user with post request:"/api/auth/getuser" -- LOGIN REQUIRED -- ROUTE 3

router.post('/getuser',fetchuser,async (req,res)=>{

  try {
     const userId = req.user.id;
     const user = await User.findById(userId).select('-password');
     res.send(user);
  } catch (error) {
      console.log(error.message)
      res.status(500).send('Internal server error')
  }
}
)

module.exports = router;