// import mongoose from 'mongoose'
import request from 'supertest'
import express from 'express'
import AuthController from '../routes/AuthController'
import { logRotationJob } from '../helpers/logger'

describe('AuthController', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    const authController = new AuthController()
    app.use(express.json())
    app.use('/', authController.router)
  })

  it('should login a user', async () => {
    // Arrange
    const mockUser = { username: 'admin', password: 'SomeSecurePassword' }

    // Act
    const response = await request(app).post('/auth/login').send(mockUser)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('OK')
  }, 1000) // Timeout of 10 seconds

  afterAll(async () => {
    // await mongoose.connection.close()
    logRotationJob.stop()
  })
})
