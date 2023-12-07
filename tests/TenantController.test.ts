import request from 'supertest'
import express from 'express'
import TenantController from '../routes/TenantController'
import TenantModel from '../models/tenants'

describe('TenantController', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    const tenantController = new TenantController()
    app.use(express.json())
    app.use('/', tenantController.router)
  })

  it('should create a new tenant', async () => {
    // Arrange
    const mockTenant = { name: 'TestTenant' }

    // Act
    const response = await request(app).post('/tenant').send(mockTenant)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.tenant.name).toBe(mockTenant.name)
  }, 10000) // Timeout of 10 seconds

  it('should get all tenants', async () => {
    // Act
    const response = await request(app).get('/tenants')

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
  }, 10000) // Timeout of 10 seconds

  afterAll(async () => {
    // Clean up code here
    // Delete the test tenant from the database
    await TenantModel.deleteOne({ name: 'TestTenant' })
  })
})
