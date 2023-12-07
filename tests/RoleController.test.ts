import { Request, Response, Router } from 'express'
import log from '../helpers/logger'
import auth from '../middleware/auth'
import RoleModel from '../models/roles'

// Define a class for the Role controller
class RoleController {
  // Define the path for the Role routes
  public path = '/role'
  // Initialize an instance of the express Router
  public router = Router()

  // Define a constructor that initializes the roles and routes
  constructor () {
    this.initialiseRoles()
    this.initialiseRoutes()
  }

  // This method initializes the roles in the database
  // It checks if there are any roles, and if not, it creates a SuperAdmin role
  private async initialiseRoles () {
    const hasRoles = (await RoleModel.countDocuments({})) > 0

    if (hasRoles) return

    const superAdmin = new RoleModel({
      role_no: 0,
      name: 'SuperAdmin',
      description: 'Highest user level, this account can do anything.',
    })

    await superAdmin.save()

    log(0, 'SuperAdmin role has been created.')
  }

  // This method initializes the routes for this controller
  // It sets up GET and POST routes for the /role path
  private initialiseRoutes () {
    this.router.get(this.path, auth, this.getRoles.bind(this))
    this.router.post(this.path, auth, this.createRole.bind(this))
  }

  // This method handles GET requests to the /role route
  // It retrieves all the roles from the database and sends them in the response
  private async getRoles (req: Request, res: Response) {
    const roles = await RoleModel.find({})
    res.status(200).json({ roles })
  }

  // This method handles POST requests to the /role route
  // It creates a new role with the data from the request body and saves it to the database
  private async createRole (req: Request, res: Response) {
    const roleData = req.body
    const newRole = new RoleModel(roleData)
    await newRole.save()
    res.status(201).json({ role: newRole })
  }
}

export default RoleController
