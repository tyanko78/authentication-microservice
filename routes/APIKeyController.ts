// base class
import RouteBase from './RouteBase'

// packages
import jwt from 'jsonwebtoken'

// helpers
import log from '../helpers/logger'
import auth from '../middleware/auth'

// models
import KeyModel from '../models/apikeys'
import { missingKeys } from '../helpers/missingKeys'

import { Request, Response } from 'express'

interface User {
  _id: string
  role: number
  username: string
}

interface Params {
  id?: string
}

interface Body {
  name?: string
  description?: string
  role?: number
  limit?: number
  page?: number
  [key: string]: any
}

interface RequestWithUser extends Request {
  user: User
  body: Body
  params: Params
}
// data
const { JWT_SECRET_KEY } = process.env

export default class APIKeyController extends RouteBase {
  constructor () {
    super('/api-key')

    this.initialiseRoutes()
  }

  initialiseRoutes () {
    // get all keys
    this.router.get(this.path + 's', auth, this.getAllKeys.bind(this))
    this.router.post(this.path + 's', auth, this.getAllKeys.bind(this))
    this.router.post(this.path + '/query', auth, this.getAllKeys.bind(this))

    // interact with a specific key
    this.router.post(this.path, auth, this.postCreate.bind(this))
    this.router.post(this.path + '/gen/:id', auth, this.genKey.bind(this))
    this.router.get(this.path + '/:id', auth, this.getAllKeys.bind(this))
    this.router.post(this.path + '/:id', auth, this.getAllKeys.bind(this))
    this.router.put(this.path + '/:id', auth, this.putUpdateById.bind(this))
    this.router.delete(this.path + '/:id', auth, this.deleteDeleteById.bind(this))
  }

  /**
   * GET
   * Get a list of all keys or a specific key by ID
   * Provided key is owned by requester
   *
   * @param {Request} req Request
   * @param {Response} res Response
   * @returns {Response}
   */
  async getAllKeys (req: RequestWithUser, res: Response): Promise<void> {
    if (req.user.role > 1) {
      log(1, `${req.user.username} is not authorised to get users.`)
      return res.status(401).json({ success: false, message: 'Unable to authenticate user.' })
    }

    const { limit = 0, page = 0, ...filters } = req.body

    try {
      const count = await KeyModel.find(filters).countDocuments()
      const keys = await KeyModel.find(filters)
        .limit(limit)
        .skip(page * limit)

      res.status(200).json({ count, keys, success: true, message: 'OK' })
      log(0, `Successfully returning ${keys.length} result${keys.length === 1 ? '' : 's'}`)
    } catch (err) {
      log(1, err)
      res.status(500).json({ success: false, message: err })
    }
  }

  /**
   * POST
   * Generate a new JWT that can be used for a set time
   *
   * @param {Request} req Request
   * @param {Response} res Response
   * @returns {Response}
   */
  async genKey (req: RequestWithUser, res: Response): Promise<Response> {
    const { id } = req.params
    const { _id: owner } = req.user
    const { life = 604800 } = req.body

    try {
      const key = await KeyModel.findOne({ _id: id, owner })

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'No key exists with this ID.',
        })
      }

      const token = jwt.sign({ key: { id } }, JWT_SECRET_KEY, { expiresIn: life })

      return res.status(200).json({
        success: true,
        message: 'OK',
        key: token,
      })
    } catch (err) {
      log(1, err)

      return res.status(500).json({
        success: false,
        message: err,
      })
    }
  }

  /**
   * POST
   * Creates a user in the database.
   *
   * @param {Request} req Request
   * @param {Response} res Response
   * @returns {Response}
   */
  async postCreate (req: RequestWithUser, res: Response): Promise<Response> {
    const { _id: owner, role: _role } = req.user
    const { name, description, role = _role } = req.body

    const error = missingKeys(['name'], req.body)
    if (error.length) {
      log(1, `Missing ${error.join(', ')} from body upon user creation request.`)

      return res.status(400).json({
        success: false,
        message: `Missing ${error.join(', ')} from body.`,
      })
    }

    try {
      const key = new KeyModel({ owner, name, description, role: Math.max(_role, role) })
      await key.save()

      return res.status(200).json({
        success: true,
        message: 'Successfully created a new key.',
        key,
      })
    } catch (err) {
      log(1, err)

      return res.status(500).json({
        success: false,
        message: err,
      })
    }
  }

  /**
   * PUT
   * Updates key data by ID.
   *
   * @param {Request} req Request
   * @param {Response} res Response
   * @returns {Response}
   */
  async putUpdateById (req: RequestWithUser, res: Response): Promise<Response> {
    const { id } = req.params
    const { name, description, role } = req.body

    if (!name && !description && !role) {
      return res.status(400).json({
        success: true,
        message: 'No update requested.',
      })
    }

    try {
      const key = await KeyModel.findById(id)

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'No key exists with this ID.',
        })
      }

      const isUser = String(req.user._id) === String(key._id)
      const isAdmin = req.user.role <= 1

      if (!isUser && !isAdmin) {
        log(1, `Account does not have permissions to edit this key.`)

        return res.status(401).json({
          success: false,
          message: 'You do not have permissions to edit this key.',
        })
      }

      if (name) key.name = name
      if (description) key.description = description
      if (role) key.role = Math.max(req.user.role, role)

      await key.save()

      return res.status(200).json({
        key: key.toObject(),
        success: true,
        message: 'OK',
      })
    } catch (err) {
      log(1, err)

      return res.status(500).json({
        success: false,
        message: err,
      })
    }
  }

  /**
   * DELETE
   * Deletes a key by ID.
   *
   * @param {Request} req Request
   * @param {Response} res Response
   * @returns {Response}
   */
  async deleteDeleteById (req: RequestWithUser, res: Response): Promise<Response> {
    const { id } = req.params

    try {
      const key = await KeyModel.findById(id)

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'No key exists with this ID.',
        })
      }

      const isUser = String(req.user._id) === String(key._id)
      const isAdmin = req.user.role <= 1

      if (!isUser && !isAdmin) {
        log(1, `Account does not have permissions to edit this key.`)

        return res.status(401).json({
          success: false,
          message: 'You do not have permissions to edit this key.',
        })
      }

      await KeyModel.deleteOne({ _id: String(key._id) })

      return res.status(200).json({
        success: true,
        message: 'OK',
      })
    } catch (err) {
      log(1, err)

      return res.status(500).json({
        success: false,
        message: err,
      })
    }
  }
}
