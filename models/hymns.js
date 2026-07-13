const mongoose = require("mongoose")
const Joi = require("joi")

const hymnSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categorylist",
        required: true

    },
    sort_order: {
        type: Number,
        index: true
    }
})

hymnSchema.pre('save', async function (next) {
    // Only auto-generate if it's a new document and the user didn't provide an order
    if (this.isNew && this.sort_order === undefined) {
        try {
            // Find the hymn with the highest sort_order
            const lastHymn = await this.constructor.findOne()
                .sort({ sort_order: -1 }) // Sort descending to get the max
                .select('sort_order')
                .exec();

            // If DB is empty, start at 1; otherwise, increment the highest found
            this.sort_order = lastHymn ? lastHymn.sort_order + 1 : 1;

        } catch (err) {
          throw err;
        }
    } 
});


const Hymn = mongoose.model("hymn", hymnSchema)

function validateHymn(data) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(30).required(),
        category: Joi.string(),
        author: Joi.string().min(3).max(50).allow(""),
        sort_order: Joi.number().min(1)
    })

    return schema.validate(data)
}
module.exports = { Hymn, validateHymn }