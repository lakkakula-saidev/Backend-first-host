import express from 'express'
import createError from 'http-errors'
import Blogschema from './Schema.js'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { checkBlogPostSchema, checkValidatonResult, checkSearchSchema } from "./validation.js";
import { generatePDFStream } from '../lib/generatePDFStream.js'
import { pipeline } from 'stream'
import {basicAuthMiddleware} from '../Auth/basic.js'

const blogPostRouter = express.Router()

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary, // grab cloudinaryURL feom process.env.Cludinary_URL
    params: {
        folder: 'Strive',
    },
})

const upload = multer({ storage: cloudinaryStorage }).single('uploadCover')



blogPostRouter.get('/', basicAuthMiddleware, async (req, res, next) => {
    try {
        const blogs = await Blogschema.find()
        res.send(blogs)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

blogPostRouter.get('/:id', basicAuthMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id
        const blog = await Blogschema.findById(id)
        res.send(blog)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

blogPostRouter.post('/',basicAuthMiddleware, checkBlogPostSchema,
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

blogPostRouter.put('/:id',basicAuthMiddleware, async (req, res, next) => {
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

blogPostRouter.delete('/:id', basicAuthMiddleware,  async (req, res, next) => {
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

        console.log('i am changing picture from front')

        const updatedBlog = await Blogschema.findByIdAndUpdate(req.params.id, { cover: req.file.path }, { runValidators: true, new: true })
        if (updatedBlog) {
            res.send(updatedBlog)
        } else {
            next(createError(404, `Blog with _id:${req.params.id} not found`))
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
}
);

blogPostRouter.get('/:id/loadPdf', async (req, res, next) => {

    try {
        const blog = await Blogschema.findById(req.params.id)

        if (blog) {

            const source = await generatePDFStream(blog)
            const destination = res
            res.setHeader("Content-Disposition", `attachment; filename=${blog.author.name}.pdf`)
            pipeline(source, res, err => next(err))

        } else {
            const error = new Error("Blog post validation is failed");
            error.status = 400;
            next(error);
        }

    } catch (error) {
        next(error);
    }
})


blogPostRouter.get('/:id/comments', async (req, res, next) => {
    try {
        const comments = await Blogschema.findById(req.params.id, { comments: 1 })
        if (comments) {
            res.send(comments)
        } else {
            res.send('No comments available')
        }
    } catch (error) {
        next(error)
    }

})
blogPostRouter.get('/:id/comments/:commentId', async (req, res, next) => {
    try {
        const comment = await Blogschema.findOne({ _id: req.params.id }, { comments: { $elemMatch: { _id: req.params.commentId } } })
        if (comment) {
            res.send(comment)
        } else {
            const error = new Error(`No comment with Id:${this.params.commentId} found`);
            error.status = 404;
            next(error);
        }
    } catch (error) {
        next(error)
    }

})
blogPostRouter.post('/:id', async (req, res, next) => {

    try {

        const updatedComments = await Blogschema.findByIdAndUpdate(req.params.id, { $push: { comments: req.body }, }, { runValidators: true, new: true })
        if (updatedComments) {
            res.send(updatedComments)
        } else {
            next(createError(404, `Blogpost with ${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(error)
    }

})
blogPostRouter.put('/:id/comments/:commentId', async (req, res, next) => {
    try {
        const comment = await Blogschema.findOneAndUpdate(
            { _id: req.params.id, 'comments._id': req.params.commentId },
            { $set: { "comments.$": req.body } },
            { runValidators: true, new: true })

        if (comment) {
            res.send(comment)
        } else {
            next(createError(404, `Comment with ID:${req.params.commentId} not found`))
        }
    } catch (error) {
        next(error)
    }

})
blogPostRouter.delete('/:id/comments/:commentId', async (req, res, next) => {
    try {
        const comment = await Blogschema.findByIdAndUpdate(req.params.id, { $pull: { comments: { _id: req.params.commentId } } },
            {
                new: true,
            })
        if (comment) {
            res.send(comment)
        } else {
            next(createError(404, `Comment with Id: ${req.params.commentId} not found`))
        }
    } catch (error) {
        next(error)
    }

})


export default blogPostRouter