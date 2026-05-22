const Joi = require("joi");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
})

const Category = mongoose.model("categorylist", categorySchema)

function validateCategory(data) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required()
    })
    return schema.validate(data)
}

module.exports = { Category, validateCategory }