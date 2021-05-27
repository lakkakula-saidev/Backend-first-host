import express from "express";
import fs from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import sendEmail from '../files/sendEmail.js'

const userMail = express.Router()


userMail.post('/', async (req, res, next) => {

    try {
        const email = req.body
        console.log('request from frontend')
        /* console.log(email.emailAddress) */
        await sendEmail(email.emailAddress)
        res.send('Email sent sucessfully')

    } catch (error) {
        next(Error)
    }

})

export default userMail