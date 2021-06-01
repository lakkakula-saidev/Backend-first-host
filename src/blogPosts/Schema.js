import mongoose from 'mongoose'

const { Schema, model } = mongoose

const BlogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    "author.name": {
        type: String,
        required: true,
    },
    /* "author.avatar": {
        type: String,
        required: true,
        lowercase: true,
    }, */

    "readTime.value": {
        type: Number,
        required: true,
    },
    "readTime.unit": {
        type: String,
        required: true,
    }
},
    { timestamps: true }

)

export default model('Blogpost', BlogSchema)