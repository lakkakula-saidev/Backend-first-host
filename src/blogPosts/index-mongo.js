import express from 'express'
import createError from 'http-errors'
import Blogschema from './Schema.js'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { checkBlogPostSchema, checkValidatonResult, checkSearchSchema } from "./validation.js";

const blogPostRouter = express.Router()

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary, // grab cloudinaryURL feom process.env.Cludinary_URL
    params: {
        folder: 'Strive',
    },
})

const upload = multer({ storage: cloudinaryStorage }).single('uploadCover')



blogPostRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await Blogschema.find()
        res.send(blogs)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

blogPostRouter.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const blog = await Blogschema.findById(id)
        res.send(blog)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

blogPostRouter.post('/', checkBlogPostSchema,
    checkValidatonResult, async (req, res, next) => {
        try {
            const newBlog = new Blogschema(req.body)
            const { _id } = await newBlog.save()
            res.status(201).send(_id)
        } catch (error) {
            console.log(error)
            next(createError(500, 'An error occured while getting data'))
        }
    })

blogPostRouter.put('/:id', async (req, res, next) => {
    try {
        const blog = await Blogschema.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
        if (blog) {
            res.send(blog)
        } else {
            next(createError(404, `Blog with _id:${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

blogPostRouter.delete('/:id', async (req, res, next) => {
    try {
        const blog = await Blogschema.findByIdAndDelete(req.params.id)
        if (blog) {
            res.status(204).send()
        } else {
            next(createError(404, `Blog ${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

blogPostRouter.post("/:id/uploadCover", upload, async (req, res, next) => {

    try {
        const idOfTheBlogPost = req.params.id;

        /* await writeBlogPostCover(`${idOfTheBlogPost}${extname(req.file.originalname)}`, req.file.buffer)

        const CoverPath = `${req.protocol}://${req.get("host")}/img/blogPosts/${req.params.id}${extname(req.file.originalname)}` */
        console.log('i am changing picture from front')
        const CoverPath = req.file.path
        await setCoverUrl(CoverPath, req.params.id)

        res.send()
    } catch (error) {


        next(error)
    }
}
);


export default blogPostRouter