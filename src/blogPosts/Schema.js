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
    cover: {
        type: String,

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
    },
    comments: [
        {
            author: {
                type: String,
            },
            content: {
                type: String,
            }, date: Date,
        }
    ]
},
    { timestamps: true }

)

export default model('Blogpost', BlogSchema)