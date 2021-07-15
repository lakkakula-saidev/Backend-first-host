import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const { Schema, model } = mongoose

const AuthorSchema = new Schema(

  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: { type: String },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    avatar: {
      type: String,

      default: ''
    },
    googleId: {
      type: String
    }
  },
  { timestamps: true }
)

AuthorSchema.pre("save", async function (next) {
  const newAuthor = this

  const plainPw = newAuthor.password

  if (newAuthor.isModified("password")) {
    newAuthor.password = await bcrypt.hash(plainPw, 10)
  }
  next()
})

AuthorSchema.statics.updatePassword = async function (body) {
  let password = body

  password = await bcrypt.hash(body, 10)
  return password
}


AuthorSchema.statics.checkCredentials = async function (email, plainPw) {
  // 1. find author in db by email

  const author = await this.findOne({ email })

  if (author) {
    // 2. compare plainPw with hashed pw
    const hashedPw = author.password

    const isMatch = await bcrypt.compare(plainPw, hashedPw)

    // 3. return a meaningful response

    if (isMatch) return author
    else return null

  } else {
    return null
  }


}


export default model('Author', AuthorSchema)