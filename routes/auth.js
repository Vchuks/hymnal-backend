const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const { validate, User } = require("../models/auth");

router.post("/login", async (req, res) => {
   
        //validate user's input
        const { error } = validate(req.body);
        if (error) return res.json(error.details[0].message);
        //get user if exists
        const findUser = await User.findOne({ username: req.body.username });
      
        if (!findUser) return res.status(400).json("Invalid user");
        //validate password of valid user
        const validPassword = await bcrypt.compare(
            req.body.password,
            findUser.password,
        );

        if (!validPassword) {
            return res.status(400).json("Invalid username or password");
        }
        
        if (findUser && validPassword) {
            const getToken = findUser.generateToken();
           
            res.json({
                name: findUser.username,
                token: getToken,
            });
        }
   
});

router.post("/register", async (req, res) => {
  
        const { error } = validate(req.body)
        if (error) return res.json(error.details[0].message);
        //check if user exists
        const findUser = await User.findOne({ username: req.body.username });
       
        if (findUser) return res.status(400).json("User already exists");

        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        })

        const salt = await bcrypt.genSalt()
        const updatedPassword = await bcrypt.hash(newUser.password, salt)
        newUser.password = updatedPassword

        await newUser.save()
        res.status(201).json("User created!")
   
})
module.exports = router