import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'

import AuthorModel from '../Authors/schema.js'
import { JWTAuthenticate } from './tools.js'

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:3001/authors/googleRedirect"
}, async (accessToken, refreshToken, profile, passportNext) => { // this function will be executed when we got a response back from Google
    try {
        console.log(profile)
        // when we receive the profile we are going to check if it is an existant author in our db, if it is not we are going to create a new record
        const author = await AuthorModel.findOne({ googleId: profile.id })

        if (author) { // if the author is already in the db, I'm creating for him a pair of tokens
            const tokens = await JWTAuthenticate(author)
            passportNext(null, { author, tokens })
        } else { // if the author is not in the db, I'm creating a new record for him, then I'm creating a pair of tokens
            const newAuthor = {
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
                role: "author",
                googleId: profile.id
            }

            const createdAuthor = new AuthorModel(newAuthor)

            const savedAuthor = await createdAuthor.save()

            const tokens = await JWTAuthenticate(savedAuthor)
            passportNext(null, { author: savedAuthor, tokens })
        }

    } catch (error) {
        passportNext(error)
    }

}
))

passport.serializeAuthor(function (author, passportNext) { // this is for req.author

    passportNext(null, author)
})


// passport.use("facebook")

export default {}