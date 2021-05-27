import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createReadStream } from "fs";


const { readJSON, writeJSON, writeFile } = fs;

const authorsFolderPath = join(
    dirname(fileURLToPath(import.meta.url)), "../../public/img/authors");

const blogsFolderPath = join(
    dirname(fileURLToPath(import.meta.url)), "../../public/img/blogPosts");

const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../Authors");

const blogPostsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../blogPosts");


export const getBlogPosts = async () => {
    const content = await readJSON(join(blogPostsJSONPath, 'blogPosts.json'))
    return content;
};
export const getAuthors = async () => {
    const content = await readJSON(join(authorsJSONPath, 'authors.json'))
    return content;
};

export const getAuthorsReadStream = () => {
    const content = fs.createReadStream(join(blogPostsJSONPath, 'blogPosts.json'))
    return content;
};

export const writeAuthorsPictures = async (fileName, data) =>
    await writeFile(join(authorsFolderPath, fileName), data);

export const writeBlogPostCover = async (fileName, data) => {

    await writeFile(join(blogsFolderPath, fileName), data);
}

// *********export paths*******

export const getCurrrentFolderPath = (currentFile) =>
    dirname(fileURLToPath(currentFile));

export const authorAvatarPath = () => authorsFolderPath

export const blogsCoverPath = () => blogsFolderPath


// ************** Set Images Urls *************************

export const setAuthorAvatarUrl = async (avatarURL, id) => {
    console.log('I am heere')
    const getAuthor = await getAuthors()
    console.log(getAuthor)
    const AuthorsData = getAuthor.map(item => {

        if (item._id == id) {
            console.log('I am here')
            item.cover = avatarURL
        }
        return item
    })

    await writeJSON(join(authorsJSONPath, 'Authors.json'), AuthorsData);
}


export const setCoverUrl = async (coverURL, id) => {

    const coverImgPost = await getBlogPosts()
    const singlePost = coverImgPost.map(post => {

        if (post._id === id) {
            console.log('I am here...')
            post.cover = coverURL
        }

        return post
    })


    /*  })
    /*  coverImgPost.cover = coverURL */

    /*  const remainingPosts = await getBlogPosts().find(post => post._id !== id)
     await remainingPosts.push(coverImgPost) */
    await writeJSON(join(blogPostsJSONPath, 'blogPosts.json'), singlePost);

}