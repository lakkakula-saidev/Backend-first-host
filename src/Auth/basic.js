import createError from 'http-errors'
import atob from 'atob'
import BlogpostModel from '../blogPosts/Schema.js'
import AuthorModel from '../Authors/Schema.js'

export const basicAuthMiddleware = async (req, res, next) => {

  console.log(req.headers)

  // 1. Check if Authorization header is received, if it is not --> trigger an error (401)
  if(!req.headers.authorization){
    next(createError(401, "Please provide credentials in the authorization header!"))
  } else {
    // 2. Decode and extract credentials from the Authorization header (they are in base64 --> string)

    const decoded = atob(req.headers.authorization.split(" ")[1])
    console.log(decoded)

    const [email, password] = decoded.split(":")

    /* console.log(email)
    console.log(password) */
    // 3. Check the validity of credentials (find author in db by email, and compare plain pw with hashed), if they are not valid --> trigger an error (401)

    const author = await AuthorModel.checkCredentials(email, password)

    if(author){
      // 4. Proceed to the route handler if credentials are fine

        if(req.method === 'PUT' || req.method === 'DELETE'){
     
            try {
                const originalAuthorPost = await BlogpostModel.findById(req.params.id)

                if(originalAuthorPost.author.name === author.name){
                    next()
                }else{
                next(createError(401, "Credentials are not correct!...Name mainly"))
            }
            } catch (error) {
                console.log(error)
                next(createError(500, 'An error occured while getting data'))
            }
            
            
        }

      next()

    } else {
      next(createError(401, "Credentials are not correct!"))
    }

    
  }
}