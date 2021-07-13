import express from "express";
import fs from "fs"; // core module to acess  content in the files like READ, Write into the files
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import uniqid from "uniqid";
import multer from 'multer'
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { authorAvatarPath, setAuthorAvatarUrl, writeAuthorsPictures, } from "../lib/fs-tools.js";

const authorRouter = express.Router();

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, // grab cloudinaryURL feom process.env.Cludinary_URL
  params: {
    folder: 'Authors',
  },
})

const upload = multer({ storage: cloudinaryStorage }).single('uploadAvatar')


const filePath = fileURLToPath(import.meta.url);
const currentPath = dirname(filePath);
const authorJSONPath = join(currentPath, "authors.json");

const getAuthors = () => {
  const content = JSON.parse(fs.readFileSync(authorJSONPath)); // 1. read the requested JSON file as the Buffer of machin unerstanalll and not han understandable
  return content;
};


authorRouter.post("/", (req, res) => {
  const newAuthor = { ...req.body, _id: uniqid(), createdAt: new Date() };
  const contentAsBuffer = fs.readFileSync(authorJSONPath).toString(); // 1. read the requested JSON file as the as human readable by converting the BUFFER into human readable
  const authors = JSON.parse(contentAsBuffer);
  authors.push(newAuthor);
  fs.writeFileSync(authorJSONPath, JSON.stringify(authors));
  res.status(201).send(newAuthor._id);
});

authorRouter.get("/", (req, res) => {
  let authors = getAuthors();
  res.send(authors);
});

authorRouter.get("/:id", (req, res) => {
  const author = JSON.parse(fs.readFileSync(authorJSONPath).toString()).find(
    (item) => item._id === req.params.id
  );

  res.send(author);
});

authorRouter.put("/:id", (req, res) => {
  const actualAuthors = JSON.parse(fs.readFileSync(authorJSONPath).toString());

  const remainingAuthors = actualAuthors.filter(
    (item) => item._id !== req.params.id
  );
  const updatedAuthor = { ...req.body, _id: req.params.id };
  remainingAuthors.push(updatedAuthor);
  fs.writeFileSync(authorJSONPath, JSON.stringify(remainingAuthors));
  res.send(updatedAuthor);
});

authorRouter.delete("/:id", (req, res) => {
  const remainingAuthors = JSON.parse(
    fs.readFileSync(authorJSONPath).toString()
  ).filter((item) => item._id !== req.params.id);

  fs.writeFileSync(authorJSONPath, JSON.stringify(remainingAuthors));
  res.status(204).send();
});



authorRouter.post("/:id/uploadAvatar", multer().single("uploadAvatar"), async (req, res, next) => {
  try {

    const idOfTheAuthor = req.params.id
    await writeAuthorsPictures(`${idOfTheAuthor}${extname(req.file.originalname)}`, req.file.buffer)

    const AvatarPath = `${req.protocol}://${req.get("host")}/img/authors/${idOfTheAuthor}${extname(req.file.originalname)}`

    await setAuthorAvatarUrl(AvatarPath, req.params.id)

    res.send()
  } catch (error) {
    next(error)
  }
}
);
export default authorRouter;

