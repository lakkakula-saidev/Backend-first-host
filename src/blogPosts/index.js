import express from "express";
import fs from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import { writeBlogPostCover, blogsCoverPath, setCoverUrl, getBlogPosts } from '../lib/fs-tools.js'
import {
  checkBlogPostSchema,
  checkValidatonResult,
  checkSearchSchema,
} from "./validation.js";
import multer from "multer";
import { pipeline } from "stream"
import { generatePDFStream } from "../lib/generatePDFStream.js"

import { Transform } from "json2csv"


const blogPostRouter = express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

/* const getBlogPosts = () => {
  const content = JSON.parse(fs.readFileSync(blogPostsJSONPath));
  return content;
}; */

const editedBlogPosts = (newContent) => {
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(newContent));
};

blogPostRouter.post(
  "/",
  checkBlogPostSchema,
  checkValidatonResult,
  async (req, res, next) => {
    try {
      const newBlog = {
        ...req.body,
        _id: uniqid(),
        /* avatar: `http://ui-avatars.com/api/?name=${name}+${surname}` */
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prevBlogs = await getBlogPosts(); // 1. read the requested JSON file as the as human readable by converting the BUFFER into human readable
      prevBlogs.push(newBlog);
      console.log('Hi I am here')
      editedBlogPosts(prevBlogs);
      res.status(201).send({ _id: newBlog._id });
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.get("/", async (req, res) => {
  let blogPosts = await getBlogPosts();
  res.send(blogPosts);
});

blogPostRouter.get(
  "/search",
  checkSearchSchema,
  checkValidatonResult,
  (req, res, next) => {
    try {
      const { title } = req.query;
      let blogPosts = getBlogPosts();
      const filtered = blogPosts.filter((blog) =>
        blog.title.toLowerCase().includes(title.toLowerCase())
      );
      res.send(filtered);
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.get("/:id", (req, res) => {
  const blogPosts = getBlogPosts();
  const particularBlogPost = blogPosts.find(
    (item) => item._id === req.params.id
  );

  res.send(particularBlogPost);
});

blogPostRouter.put(
  "/:id",
  checkBlogPostSchema,
  checkValidatonResult,
  async (req, res, next) => {
    try {
      const blogPosts = getBlogPosts();

      const remainingBlogPosts = blogPosts.filter(
        (item) => item._id !== req.params.id
      );
      const updatedBlog = { ...req.body, _id: req.params.id };
      remainingBlogPosts.push(updatedBlog);
      editedBlogPosts(remainingBlogPosts);
      res.send(updatedBlog);
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.delete("/:id", async (req, res) => {
  const remainingBlogPosts = await getBlogPosts().filter(
    (item) => item._id !== req.params.id
  );

  await editedBlogPosts(remainingBlogPosts);
  res.status(204).send();
});

blogPostRouter.post("/:id/uploadCover", multer().single("uploadCover"), async (req, res, next) => {

  try {
    const idOfTheBlogPost = req.params.id;

    await writeBlogPostCover(`${idOfTheBlogPost}${extname(req.file.originalname)}`, req.file.buffer)

    const CoverPath = `${req.protocol}://${req.get("host")}/img/blogPosts/${req.params.id}${extname(req.file.originalname)}`

    await setCoverUrl(CoverPath, req.params.id)

    res.send()
  } catch (error) {


    next(error)
  }
}
);

blogPostRouter.get('/:id/loadPdf', async (req, res, next) => {

  try {
    let blogPosts = await getBlogPosts();
    const filtered = blogPosts.filter((blog) => blog._id.toString() === req.params.id);

    if (filtered.length > 0) {

      const Content = filtered[0]
      const source = generatePDFStream(Content)
      const destination = res
      res.setHeader("Content-Disposition", `attachment; filename=${filtered[0].author.name}.pdf`)
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



/* export default blogPostRouter; */


