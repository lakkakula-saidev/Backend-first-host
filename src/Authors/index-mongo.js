import express from 'express'
import createError from 'http-errors'
import AuthorModel from './Schema.js'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

import { generatePDFStream } from '../lib/generatePDFStream.js'
import { pipeline } from 'stream'

const authorRouter = express.Router()

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary, // grab cloudinaryURL feom process.env.Cludinary_URL
    params: {
        folder: 'Strive',
    },
})

const upload = multer({ storage: cloudinaryStorage }).single('uploadCover')



authorRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await AuthorModel.find()
        res.send(blogs)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

authorRouter.get('/me', async (req, res, next) => {
    try {
        const blogs = await AuthorModel.find()
        res.send(blogs)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

authorRouter.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const blog = await AuthorModel.findById(id)
        res.send(blog)
    } catch (error) {
        console.log(error)
        next(createError(500, 'An error occured while getting data'))
    }
})

authorRouter.post('/',  async (req, res, next) => {
        try {
            const newBlog = new AuthorModel(req.body)
            const { _id } = await newBlog.save()
            res.status(201).send(_id)
        } catch (error) {
            console.log(error)
            next(createError(500, 'An error occured while posting data'))
        }
    })

authorRouter.put('/:id',  async (req, res, next) => {

    let password = req.body.password
    if(password){
        req.body.password = await AuthorModel.updatePassword(req.body.password)
    } 

    try {
        const blog = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
        
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

authorRouter.delete('/:id', async (req, res, next) => {
    try {
        const blog = await AuthorModel.findByIdAndDelete(req.params.id)
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



export default authorRouter