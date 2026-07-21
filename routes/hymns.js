const express = require("express")
const mongoose = require("mongoose")
const { Hymn, validateHymn } = require("../models/hymns")
const router = express.Router()
const authM = require("../middlewares/auth")
const adminM = require("../middlewares/role")
const { Category } = require("../models/category")
const _ = require("lodash")

router.get("/", authM, async (req, res) => {
    const getCategoryQuery = req.query.category;
    const getTitleQuery = req.query.title;
    const getAuthorQuery = req.query.author;

    let query = {};
    if (getCategoryQuery || getTitleQuery || getAuthorQuery) {
        query = {
            $or: [
                { title: getTitleQuery },
                { author: getAuthorQuery },
                { category: getCategoryQuery },
            ]
        };
    }

    try {
        const getSongs = await Hymn.find(query)
            .populate('category', 'name -_id')
            .sort({ sort_order: 1, title: 1 })
            .limit(20).select("-__v").lean();
        const customResponse = getSongs.map(hymn => ({
            ...hymn,
            category: hymn.category ? hymn.category.name : null
        }));
        return res.json(customResponse);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching hymns" });
    }
});



router.post("/", [authM, adminM], async (req, res) => {
    const { error } = validateHymn(req.body)
    if (error) return res.json(error.details[0].message)

    const categoryDoc = await Category.findOne({ name: req.body.category });
    if (!categoryDoc) return res.status(400).send('Invalid category name.');

    const newHymn = new Hymn({
        title: req.body.title,
        category: categoryDoc._id,
        author: req.body.author,
        sort_order: req.body.sort_order
    })

    await newHymn.save()
    res.status(201).json({ message: "Hymn created!" })
})

router.put("/:id", [authM, adminM], async (req, res) => {
    const { title, category, sort_order, author } = req.body;
        let categoryId = category;

        // 1. Check if the client sent a raw string name instead of an ObjectId
        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            // Find the category document matching the text name (case-insensitive)
            const foundCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${category}$`, "i") } 
            });

            if (!foundCategory) {
                return res.status(400).json({ 
                    message: `Category '${category}' does not exist. Please create it first.` 
                });
            }
            
            // Swap the raw text string out for the real database ObjectId
            categoryId = foundCategory._id;
        }

        // 2. Construct the update payload with the clean ID
        const updatedSong = { 
            title, 
            category: categoryId, 
            sort_order, 
            author 
        };
    
    const getSongs = await Hymn.findByIdAndUpdate(req.params.id, updatedSong, { new: true })
    res.json({ data: _.pick(getSongs, ["title", "sort_order", "category","author"]), message: "Update Successful!" })
})

router.delete("/:id", [authM, adminM], async (req, res) => {
    const getSongs = await Hymn.findByIdAndDelete(req.params.id)
    if (!getSongs) {
        res.status(404).send("Hymn not found")
    }
    res.json({ message: "Delete Successful!" })
})

module.exports = router