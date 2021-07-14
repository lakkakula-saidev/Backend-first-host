import jwt from 'jsonwebtoken'


export const JWTAuthenticate = async (author) => {

    const accessToken = await generateJWT({ _id: author._id, name: author._id })
    return accessToken
}

export const generateJWT = payload => new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
        if (err) reject(err)

        resolve(token)
    }))


export const verifyToken = token => new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, decodedToken) => {
        if (err) reject(err)

        resolve(decodedToken)
    }))