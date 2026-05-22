const express = require("express")
const router = express.Router()
const _ = require("lodash")
const authM = require("../middlewares/auth")
const adminM = require("../middlewares/role")
const { Category, validateCategory } = require("../models/category")

router.get("/", authM, async (req, res) => {
    const result = await Category.find().sort({ name: 1 }).select("-__v")
    return res.json(result)
})

router.post("", [authM, adminM], async (req, res) => {
    const { error } = validateCategory(req.body)
    if (error) return res.json(error.details[0].message)

    const getCategory = await Category.findOne({ name: req.body.name })
    if (getCategory) {
        return res.status(400).json({ message: "Category exists already!" })
    }

    const newCategory = new Category({
        name: req.body.name,
    })

    const result = await newCategory.save()
    res.status(201).json({  message: "Category created!" })
})

router.put("/:id", [authM, adminM], async (req, res) => {
    const getCategory = await Category.findByIdAndUpdate(req.params.id,{name: req.body.name}, {new: true})
    res.json({data:_.pick(getCategory, ["name"]), message: "Update Successful!"})
})

router.delete("/:id", [authM, adminM], async (req, res) => {
    const getCategory = await Category.findByIdAndDelete(req.params.id)
    if (!getCategory) {
        res.status(404).send("Category not found")
    }
    res.json({ message: "Delete Successful!"})
    
})


module.exports = router