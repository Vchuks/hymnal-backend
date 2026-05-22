const mongoose = require("mongoose")
const Joi = require("joi")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        minLength: 5,
        maxLength: 1024,
        required: true,
    },
    role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user', 
    required: true
  },
})

userSchema.methods.generateToken = function(){
    const secretKey= process.env.JwtKey
    const token = jwt.sign({id: this._id, isAdmin: this.role }, secretKey)
    return token
}

const User = mongoose.model("user", userSchema)

function validate(data) {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(5).max(10).required()
    })

    return schema.validate(data)
}

module.exports = { validate, User }