import request from 'supertest'
import express from 'express'
import UserController from '../routes/UserController'
import UserModel from '../models/user'

describe('UserController', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    const userController = new UserController()
    app.use(express.json())
    app.use('/', userController.router)
  })

  it('should create a new user', async () => {
    // Arrange
    const mockUser = {
      email: 'test@test.com',
      username: 'testUser',
      name: 'Test User',
      password: 'testPassword',
      additionalFields: {},
      role: 0,
      tenant: 'testTenant',
    }

    // Act
    const response = await request(app).post('/user').send(mockUser)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.user.username).toBe(mockUser.username)
  }, 10000) // Timeout of 10 seconds

  afterAll(async () => {
    // Clean up code here
    // Delete the test user from the database
    await UserModel.deleteOne({ username: 'testUser' })
  })
})
