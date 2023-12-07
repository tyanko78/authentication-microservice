import { Request, Response } from 'express'
import { Types } from 'mongoose'
import RouteBase from './RouteBase'
import auth from '../middleware/auth'
import TenantModel from '../models/tenants'
import UserModel from '../models/user'
import log from '../helpers/logger'

// Get MULTI_TENANCY from environment variables
const { MULTI_TENANCY } = process.env

// TenantController class extends RouteBase
export default class TenantController extends RouteBase {
  constructor () {
    // Call parent constructor with the path
    super('/tenant')

    // If MULTI_TENANCY is not set or set to 'false', return
    if (!MULTI_TENANCY || MULTI_TENANCY?.toLowerCase() === 'false') return

    // Initialise endpoints
    this.initialiseEndpoints()
  }

  // Method to initialise endpoints
  initialiseEndpoints () {
    // Create tenant endpoint
    this.router.post(this.path, auth, this.createTenant)

    // Read tenants endpoints
    this.router.get(this.path + 's', auth, this.readTenants)
    this.router.post(this.path + 's', auth, this.readTenants)
    this.router.get(this.path + '/:id', auth, this.readTenants)

    // Update tenant endpoint
    this.router.put(this.path + '/:id', auth, this.updateTenant)

    // Delete tenant endpoint
    this.router.delete(this.path + '/:id', auth, this.deleteTenant)
  }

  // Method to create a tenant
  async createTenant (req: Request, res: Response) {
    const { role } = req?.user || {}
    const { name } = req?.body || {}

    if (role > 0) {
      return res
        .status(403)
        .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })
    }

    if (!name) {
      return res.status(400).json({ status: 400, success: false, message: 'Missing name from body.' })
    }

    try {
      const exists = await TenantModel.exists({ name })

      if (exists) {
        return res.status(400).json({ status: 400, success: false, message: 'Tenant with this name already exists.' })
      }

      const tenant = new TenantModel({ name })
      await tenant.save()

      return res.status(200).json({ status: 200, success: true, message: 'Success.', tenant })
    } catch (err) {
      log(2, err)

      return res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })
    }
  }

  // Method to read tenants
  async readTenants (req: Request, res: Response) {
    const { role } = req?.user || {}
    const { id } = req?.params || {}
    const { limit, page, search, sort } = req?.body || {}

    if (role > 0) {
      return res
        .status(403)
        .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })
    }

    if (id) {
      if (!Types.ObjectId.isValid(id)) {
        return res.status(404).json({ status: 404, success: false, message: 'Not found.' })
      }

      try {
        const tenant = await TenantModel.findById(id)

        return res.status(200).json({ status: 200, success: true, message: 'Success.', data: tenant })
      } catch (err) {
        log(2, err)

        return res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })
      }
    }

    let query: { name?: { $regex: string; $options: string } } = {}
    if (search) query.name = { $regex: search, $options: 'i' }

    try {
      const [tenantCount, tenants] = await Promise.all([
        TenantModel.find(query).count(),
        TenantModel.find(query)
          .sort(sort)
          .limit(limit || 0)
          .skip((page || 0) * (limit || 0)),
      ])

      return res
        .status(200)
        .json({ status: 200, success: true, message: 'Success.', data: tenants, count: tenantCount })
    } catch (err) {
      log(2, err)

      return res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })
    }
  }

  // Method to update a tenant
  async updateTenant (req: Request, res: Response) {
    const { id } = req?.params || {}
    const { name, status } = req?.body || {}
    const { role } = req?.user || {}

    if (role > 0) {
      return res
        .status(403)
        .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })
    }

    if (!id) return res.status(400).json({ status: 400, success: false, message: 'Missing id param.' })

    try {
      const valid = await TenantModel.findByIdAndUpdate(id, { name, status })

      if (!valid) return res.status(404).json({ status: 404, success: false, message: 'Not found.' })

      const updatedRecord = await TenantModel.findById(id)

      return res.status(200).json({ status: 200, success: true, message: 'Success.', data: updatedRecord })
    } catch (err) {
      log(2, err)

      return res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })
    }
  }

  // Method to delete a tenant
  async deleteTenant (req: Request, res: Response) {
    const { id } = req?.params || {}
    const { role } = req?.user || {}

    if (role > 0) {
      return res
        .status(403)
        .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })
    }

    if (!id) return res.status(400).json({ status: 400, success: false, message: 'Missing id param.' })

    try {
      const [valid] = await Promise.all([
        TenantModel.findByIdAndUpdate(id, { status: 0 }),
        UserModel.updateMany({ tenant: id }, { status: 0 }),
      ])

      if (!valid) return res.status(404).json({ status: 404, success: false, message: 'Not found.' })

      return res.status(200).json({ status: 200, success: true, message: 'Success.' })
    } catch (err) {
      log(2, err)

      return res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })
    }
  }
}
