import express from "express";
import fs from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import { validationResult } from "express-validator";
import { writeBlogPostCover, blogsCoverPath, setCoverUrl, getAuthorsReadStream } from '../lib/fs-tools.js'

import multer from "multer";
import { pipeline } from "stream"
import { generatePDFStream } from "../lib/generatePDFStream.js"

import { Transform } from "json2csv"

const csvRouter = express.Router();


csvRouter.get('/', async (req, res, next) => {

    try {
        const fields = ['category', 'title', 'cover']
        const options = { fields }
        const json2csv = new Transform(options)
        const csvStream = getAuthorsReadStream()
        res.header("Content-Disposition", `attachment; filename=authors.csv`)

        pipeline(csvStream, json2csv, res, err => {
            if (err) {

                next(err)
            }
        })

    } catch (error) {
        next(error)
    }
})

export default csvRouter