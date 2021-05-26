import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import fs from "fs-extra"
import uniqid from "uniqid"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import blogPostRoutes from "./blogPosts/index.js";
import authorRoutes from "./Authors/index.js";
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT || 3001;

const publicFolder = join(dirname(fileURLToPath(import.meta.url)), "../public/")

server.use(express.static(publicFolder));
// If I do not specify this line of code BEFORE the routes, all the request bodies are going to be undefined

server.use(cors({
  origin: function (origin, next) {
    if (orgin === "http://localhost:3000") {
      next(null, true)
    } else {
      next(new Error('CORS PROBLEM: ORIGIN NOT SUPPORTED' + origin))
    }
  }
}));

server.use(express.json());

const logger = async (req, res, next) => {
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
server.use(logger)
server.use("/authors", authorRoutes); // /authors will be the prefix for all the endpoints contained in the authors Router
server.use("/blogPosts", blogPostRoutes);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(catchAllErrorHandler);

console.table(listEndpoints(server));
server.listen(port, () => {
  console.log("server listening on port", port);
});