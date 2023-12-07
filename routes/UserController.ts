import bcrypt from 'bcrypt'
import { Types } from 'mongoose'
import RouteBase from './RouteBase'
import log from '../helpers/logger'
import auth from '../middleware/auth'
import { missingKeys } from '../helpers/missingKeys'
import UserModel from '../models/user'
import RoleModel from '../models/roles'
import TenantModel from '../models/tenants'
import { Request, Response } from 'express'

const { PASSWORD_POLICY, MULTI_TENANCY } = process.env

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
)
const pwdRegex = new RegExp(PASSWORD_POLICY)

export default class UserController extends RouteBase {
  constructor () {
    super('/user')

    this.initialiseRoutes()
  }

  // Initialize routes for UserController
  initialiseRoutes () {
    // Route to get all users
    // GET request to '/users' path
    this.router.get(this.path + 's', auth, this.getUsers)

    // Route to get all users
    // POST request to '/users' path
    this.router.post(this.path + 's', auth, this.getUsers)

    // Route to create a new user
    // POST request to '/user' path
    this.router.post(this.path, auth, this.postCreate)

    // Route to get a specific user by ID
    // GET request to '/user/:id' path
    this.router.get(this.path + '/:id', auth, this.getUsers)

    // Route to update a specific user by ID
    // PUT request to '/user/:id' path
    this.router.put(this.path + '/:id', auth, this.putUpdateById)

    // Route to delete a specific user by ID
    // DELETE request to '/user/:id' path
    this.router.delete(this.path + '/:id', auth, this.deleteDeleteById)
  }

  /**
   * This asynchronous function handles the GET users request.
   * It checks if the user is authorized, then retrieves users based on the provided query parameters.
   * It supports pagination, sorting, and searching by various fields.
   * It returns a JSON response with the users data and some metadata like total count.
   */
  async getUsers (req: Request, res: Response): Promise<void> {
    // Check if the user is authorized
    if (req.user.role > 1) {
      log(1, `${req.user.username} is not authorised to get users.`)
      return res.status(401).json({ success: false, message: 'Unable to authenticate user.' })
    }

    const { id } = req?.params
    const { sort = { name: 1 }, limit = 0, include_deleted, page = 0, search } = req?.body || {}
    const query: any = id ? { _id: id } : {}

    // Exclude deleted users if not explicitly included
    if (!include_deleted && !id) query.status = 1

    try {
      // If a search term is provided, add search conditions to the query
      if (search && !id) {
        const roles = await RoleModel.find({
          $or: [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }],
        }).distinct('role_no')

        query['$or'] = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { role: { $in: roles } },
        ]
      }

      const count = await UserModel.countDocuments(query)
      const users = await UserModel.find(query)
        .sort(sort)
        .collation({ locale: 'en', numericOrdering: true })
        .limit(limit)
        .skip(page * limit)
        .select({ password: false })
        .lean() // Use lean to improve performance

      res.status(200).json({
        count,
        [id ? 'user' : 'users']: users,
        success: true,
        message: 'OK',
      })

      log(0, `Successfully returning ${users.length} result${users.length === 1 ? '' : 's'}`)
    } catch (err) {
      log(1, err)
      return res.status(500).json({ success: false, message: err })
    }
  }

  /**
   * This function handles the creation of a new user.
   * It first checks if the user is authorized to create users.
   * Then it validates the input and checks if the user already exists.
   * If everything is valid, it creates the new user and returns a success response.
   */
  async postCreate (req: Request, res: Response): Promise<void> {
    // Check if the user is authorized
    if (req.user.role > 1) {
      log(1, `${req.user.username} is not authorised to create users.`)
      return res.status(401).json({ success: false, message: 'Unable to authenticate user.' })
    }

    const { email, username, password, additionalFields, name, role = req.user.role, tenant } = req?.body || {}
    const multiTenancy = MULTI_TENANCY && MULTI_TENANCY?.toLocaleLowerCase() !== 'false'

    // Check if the user has sufficient permissions
    if (role < req.user.role) {
      log(1, 'Unable to create user with greater permissions.')
      return res.status(403).json({ success: false, message: 'Unable to create user with greater permissions.' })
    }

    // Check if required fields are present
    const error = missingKeys(['username', 'password'], req?.body)
    if (error.length) {
      log(1, `Missing ${error.join(', ')} from body upon user creation request.`)
      return res.status(400).json({ success: false, message: `Missing ${error.join(', ')} from body.` })
    }

    // Validate email format
    if (email && !emailRegex.test(email)) {
      log(1, 'Unable to verify email format while creating a user.')
      return res.status(400).json({ success: false, message: 'Unable to verify email format.' })
    }

    // Check password against policy
    if (PASSWORD_POLICY && !pwdRegex.test(password)) {
      log(1, 'Password failed policy check while creating a user.')
      return res.status(400).json({ success: false, message: 'Password failed policy check.' })
    }

    // Check tenant validity
    const tenantDocument = await TenantModel.findById(tenant).exec()
    if (multiTenancy && !(tenantDocument?.status === 1)) {
      return res.status(400).json({ success: false, message: 'Tenancy invalid/required.' })
    }

    try {
      // Check if user already exists
      if (await UserModel.findOne({ username })) {
        log(1, `Unable to create user with the same username '${username}'.`)
        return res.status(400).json({ success: false, message: 'User already exists.' })
      }

      // Check tenant validity
      const tenantDocument = await TenantModel.findById(tenant).exec()
      if (multiTenancy && !(tenantDocument?.status === 1)) {
        return res.status(400).json({ success: false, message: 'Tenancy invalid/required.' })
      }

      // Create the new user
      const newUser = new UserModel({
        email,
        username,
        name,
        password: String(password),
        additionalFields,
        role,
        tenant,
      })
      await newUser.save()

      log(0, 'Successfully created a new user.')

      const user = newUser.toObject()
      delete user.password

      // Return the response
      res.status(200).json({ user, success: true, message: 'Successfully created a new user.' })
    } catch (err) {
      log(1, err)
      return res.status(500).json({ success: false, message: err })
    }
  }

  /**
   * This asynchronous function handles the PUT request to update a user by ID.
   * It first checks if the user is authorized to update the user.
   * Then it validates the input and checks if the user exists.
   * If everything is valid, it updates the user and returns a success response.
   */
  async putUpdateById (req: Request, res: Response): Promise<void> {
    // Extract the user ID from the request parameters
    const { id } = req?.params || {}

    // Check if the user is the same as the one being updated or if the user is an admin
    const isUser = String(req.user._id) === id
    const isAdmin = req.user.role <= 1

    // Did the user pass a cookie?
    if (!isUser && !isAdmin) {
      log(1, `Account does not have permissions to edit this user.`)

      return res.status(401).json({
        success: false,
        message: 'You do not have permissions to edit this user.',
      })
    }

    try {
      // Extract the fields to be updated from the request body
      const { username, email, password, current_password, name, role, additionalFields, status } = req?.body || {}

      // Check if any fields to be updated were provided
      if (
        !username &&
        !email &&
        !password &&
        !name &&
        typeof role === 'undefined' &&
        typeof status === 'undefined' &&
        !additionalFields
      ) {
        return res.status(400).json({
          success: true,
          message: 'No update requested.',
        })
      }

      // Find the user to be updated
      const user = await UserModel.findById(String(id))

      // Check if the user exists
      if (!user) {
        log(1, `Unable to find user with ID '${String(id)}' in order to update their account.`)

        res.status(400).json({
          success: false,
          message: `Unable to find user with ID '${String(id)}'.`,
        })

        return
      }

      // Check if the user has sufficient permissions to update the user
      if (user.role < req.user.role) {
        log(1, 'Unable to modify user with greater permissions.')

        return res.status(403).json({
          success: false,
          message: `Unable to modify user with greater permissions.`,
        })
      }

      // If the user has updated their password, check if the current password was provided and if it's correct
      if (password) {
        // Have they supplied their current password?
        if (!isAdmin && !current_password) {
          log(
            1,
            `User tried to update their password without supplying their current password (current_password) - '${String(
              id,
            )}'`,
          )

          res.status(400).json({
            success: false,
            message: 'Please provide your current password in order to update it.',
          })

          return
        }

        if (current_password && !bcrypt.compareSync(current_password, user.password)) {
          log(1, `Unable to update password for '${String(id)}' as they have provided the incorrect current password.`)

          res.status(400).json({
            success: false,
            message: `Unable to update password as your current password is incorrect.`,
          })

          return
        }
      }

      // Validate the email using a regular expression
      if (email && !emailRegex.test(email)) {
        log(2, 'Unable to update user with invalid email.')

        // Return a response with a status of 400 and a message indicating the email is invalid
        return res.status(400).json({
          success: false,
          message: 'Unable to update user with invalid email.',
        })
      }

      // Check if a password policy is enforced, and if so, validate the password
      if (PASSWORD_POLICY && password && !pwdRegex.test(password)) {
        log(2, 'Unable to update user with failing password.')

        // Return a response with a status of 400 and a message indicating the password is invalid
        return res.status(400).json({
          success: false,
          message: 'Unable to update user with failing password.',
        })
      }

      // Update the user's fields if they are provided
      if (username) user.username = username
      if (email) user.email = email
      if (password) user.password = password
      if (name) user.name = name
      if (isAdmin && !isUser && role) user.role = role
      if (isAdmin && !isUser && status) user.status = status

      // If the user is an admin and not the user being updated, and additional fields are provided, update them
      if (isAdmin && !isUser && additionalFields) {
        // Merge the existing and new additional fields
        const _af = { ...user.additionalFields, ...additionalFields }
        // Remove any fields that are set to null
        user.additionalFields = Object.keys(_af).reduce((obj, key) => {
          if (Boolean(_af[key] !== null)) obj[key] = _af[key]

          return obj
        }, {})
      }

      // Save the updated user to the database
      await user.save()

      // Log a info message.
      log(0, `Successfully updated user data for '${user.username}' with ID '${String(id)}'.`)

      // Return the response.
      res.status(200).json({
        user: (
          await UserModel.findById(String(id)).select({
            _id: false,
            password: false,
          })
        ).toObject(),
        success: true,
        message: 'OK',
      })

      return
    } catch (err) {
      log(1, err)

      return res.status(500).json({
        success: false,
        message: err,
      })
    }
  }

  /**
   * This asynchronous function handles the DELETE user request by ID.
   * It first checks if the user is authenticated and has the necessary permissions.
   * Then it retrieves the user from the database and checks if the user exists and if the user has greater permissions.
   * If the user is already marked for deletion, it returns a message indicating that.
   * If the request body contains a 'hard_delete' field, it deletes the user permanently, otherwise it marks the user for deletion.
   * It returns a JSON response with the user data (if not hard deleted), a success status, and a message.
   * It also logs an info message indicating the user has been successfully deleted.
   */
  async deleteDeleteById (req: Request, res: Response): Promise<void> {
    // Check if the user has the necessary permissions
    if (req.user.role > 1) {
      log(1, 'Unable to authenticate user while deleting account.')

      // Return a response with a status of 401 and a message indicating the user is not authenticated
      return res.status(401).json({
        success: false,
        message: 'Unable to authenticate user.',
      })
    }

    // Extract the id from the request parameters
    const { id } = req.params

    try {
      // Retrieve the user from the database, excluding the password field
      const user = await UserModel.findById(id).select({
        password: false,
      })

      // If the user does not exist, return a response with a status of 400 and a message indicating the user does not exist
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User does not exist.',
        })
      }

      // If the user has greater permissions, return a response with a status of 403 and a message indicating the user has greater permissions
      if (user.role < req.user.role) {
        log(1, 'Unable to modify user with greater permissions.')

        return res.status(403).json({
          success: false,
          message: 'Unable to modify user with greater permissions.',
        })
      }

      // If the user is already marked for deletion and the request does not contain a 'hard_delete' field, return a response with a status of 200 and a message indicating the user is already marked for deletion
      if (user.deleted_at !== null && !req.body.hard_delete) {
        return res.status(200).json({
          success: false,
          message: 'User is already marked for deletion',
        })
      }

      // If the request contains a 'hard_delete' field, delete the user permanently, otherwise mark the user for deletion
      if (req.body.hard_delete) {
        await UserModel.deleteOne({ _id: id })
      } else {
        await UserModel.findByIdAndUpdate(id, {
          status: 0,
          deleted_at: Date.now(),
        })
      }

      // Return a response with a status of 200, the user data (if not hard deleted), a success status, and a message
      res.status(200).json({
        user: req.body.hard_delete ? null : user.toObject(),
        success: true,
        message: 'OK',
      })

      // Log an info message indicating the user has been successfully deleted
      log(
        0,
        `Successfully deleted (${req.body.hard_delete ? 'hard' : 'soft'}) user '${user.username}' with ID '${id}'.`,
      )

      return
    } catch (err) {
      // Log the error and return a response with a status of 500 and a message containing the error
      log(1, err)

      return res.status(500).json({
        success: false,
        message: err,
      })
    }
  }
}
