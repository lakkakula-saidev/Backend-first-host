import express from "express";
import mongoose from 'mongoose'
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import fs from "fs-extra"
import uniqid from "uniqid"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import blogPostRoutes from "./blogPosts/index-mongo.js";
import authorRoutes from "./Authors/index-mongo.js";
import csvGenerate from "./files/csvGenerate.js";
import userMail from "./Users/index.js";
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";
import passport from 'passport'
import oauth from './Auth/oAuth.js' // if I want to import this module needs to have at least an export default


const server = express();
const port = process.env.PORT || 3001;
const whiteList = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_CLOUD_URL]

/* const publicFolder = join(dirname(fileURLToPath(import.meta.url)), "../public/")

server.use(express.static(publicFolder)); */
// If I do not specify this line of code BEFORE the routes, all the request bodies are going to be undefined
const corsOptions = {
  origin: function (origin, next) {
    console.log('This is the origin', origin)
    if (whiteList.indexOf(origin) !== -1) {
      //origin allowed
      next(null, true)
    } else {
      next(new Error('CORS PROBLEM: ORIGIN NOT SUPPORTED'))
    }
    //origin not allowed  
  }
}

server.use(cors());

server.use(express.json());
server.use(passport.initialize())

/* const logger = async (req, res, next) => {
  const content = await fs.readJSON(join(dirname(fileURLToPath(import.meta.url)), "log.json"))
  content.push({
    _timeStamp: new Date(),
    method: req.method,
    resource: req.url,
    query: req.query,
    body: req.body,
    _id: uniqid()
  })

  await fs.writeJSON(join(dirname(fileURLToPath(import.meta.url)), "log.json"), content)
  next()
}
server.use(logger) */

server.use("/authors", authorRoutes); // /authors will be the prefix for all the endpoints contained in the authors Router
server.use("/blogPosts", blogPostRoutes);
server.use('/mail', userMail)
server.use('/authorCSV', csvGenerate)

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(catchAllErrorHandler);

console.table(listEndpoints(server));

mongoose.connect(process.env.MONGOOSE_CONNECTION, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).then(server.listen(port, () => {
  console.log("server listening on port", port);
})).catch(err => {
  console.log(err)
})

