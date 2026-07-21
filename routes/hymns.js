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

router.put("/:id", [authM, adminM], async (req, res, next) => {
    try {
        const { title, category, sort_order, author } = req.body;
        let categoryId = category;

        // 2. Translate a text string (like "offertory") into a MongoDB ObjectId
        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            const foundCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${category}$`, "i") } 
            });

            if (!foundCategory) {
                return res.status(400).json({ 
                    message: `Category '${category}' does not exist. Please create it first.` 
                });
            }
            
            categoryId = foundCategory._id;
        }

        const updatedSong = { 
            title, 
            category: categoryId, 
            sort_order, 
            author 
        };
    
        // 3. Update the database
        const getSongs = await Hymn.findByIdAndUpdate(req.params.id, updatedSong, { new: true });

        if (!getSongs) {
            return res.status(404).json({ message: "Hymn not found" });
        }

        // 4. Return clean JSON without needing Lodash (_.pick)
        res.json({ 
            data: {
                title: getSongs.title,
                sort_order: getSongs.sort_order,
                category: getSongs.category,
                author: getSongs.author
            }, 
            message: "Update Successful!" 
        });

    } catch (err) {
        // 5. Pass any unexpected database errors to your error middleware
        next(err);
    }
});

router.delete("/:id", [authM, adminM], async (req, res) => {
    const getSongs = await Hymn.findByIdAndDelete(req.params.id)
    if (!getSongs) {
        res.status(404).send("Hymn not found")
    }
    res.json({ message: "Delete Successful!" })
})

module.exports = router