import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import KeyModel from '../models/apikeys'
import UserModel from '../models/user'

const { JWT_SECRET_KEY, JWT_TOKEN_EXPIRE } = process.env

// Define the interface for the user payload
interface UserPayload {
  user: {
    id: string
  }
  remember: boolean
  exp: number // expiration time
}
// Define the interface for the key payload
interface KeyPayload extends JwtPayload {
  key: { id: string }
}

// Middleware function for authentication
export default async function auth (req: Request, res: Response, next: NextFunction) {
  // Extracting API key and token from headers
  const apiKey = req.headers['api-key'] as string
  const cookie = req.headers.cookie
  const cookieToken = cookie?.split('; ')?.find(c => /^AuthToken=.*$/.test(c))
  const token = cookieToken ? cookieToken.split('=')[1] : (req.headers['token'] as string)
  const { user } = jwt.verify(token, JWT_SECRET_KEY) as UserPayload

  try {
    let userQuery
    // If API key is provided
    if (apiKey) {
      // Verify the API key
      const { key } = jwt.verify(apiKey, JWT_SECRET_KEY) as KeyPayload
      // Find the key in the database
      const keyQuery = await KeyModel.findById(key.id)
      // If key is not found, throw an error
      if (!keyQuery) throw new Error('Invalid Key')
      // Find the user associated with the key
      userQuery = await UserModel.findById(user.id).select({ password: false })
      // Set the user's role and additional fields
      userQuery.role = Math.max(keyQuery.role, userQuery.role)
      userQuery.additionalFields = userQuery.additionalFields || {}
      userQuery.additionalFields.apiKey = keyQuery
    }
    // If token is provided
    else if (token) {
      // Verify the token
      const { user, remember, exp } = jwt.verify(token, JWT_SECRET_KEY) as UserPayload
      // Find the user associated with the token
      userQuery = await UserModel.findById(user.id).select({ password: false })
      // Set the token expiration time
      const expiresIn = remember ? parseInt(JWT_TOKEN_EXPIRE) : 7200
      // If the token is about to expire, create a new one
      if ((exp - Date.now() / 1000) / 60 / 60 / 24 < 2) {
        const newToken = jwt.sign({ user, remember }, JWT_SECRET_KEY, { expiresIn })
        req.update = { token: newToken, expiresIn }
        res.setHeader('Set-Cookie', `AuthToken=${newToken}; Path=/;${remember ? ` Max-Age=${expiresIn};` : ''}`)
      }
    }
    // If neither API key nor token is provided, throw an error
    else {
      throw new Error('TOKEN_ERROR')
    }
    // If the user is not found or not active, throw an error
    if (!userQuery || userQuery.status !== 1) throw new Error('Auth Error')
    // Attach the user to the request object
    req.user = userQuery
    // Proceed to the next middleware
    return next()
  } catch (err) {
    // If the error is related to the token, delete the token
    if (err.message === 'TOKEN_ERROR') {
      res.setHeader('Set-Cookie', 'AuthToken=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;')
    }
    // Send an error response
    return res.status(500).send({ status: 500, message: err.message })
  }
}
