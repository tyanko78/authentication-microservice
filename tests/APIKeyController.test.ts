import request from 'supertest'
import express from 'express'
import APIKeyController from '../routes/APIKeyController'
import KeyModel from '../models/apikeys'

describe('APIKeyController', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    const apiKeyController = new APIKeyController()
    app.use(express.json())
    app.use('/', apiKeyController.router)
  })

  // Test for getAllKeys
  it('should get all keys', async () => {
    // Act
    const response = await request(app).get('/api-keys')

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('OK')
  }, 10000) // Timeout of 10 seconds

  // Test for genKey
  it('should generate a new key', async () => {
    // Arrange
    const id = 'someId' // Replace with a valid id

    // Act
    const response = await request(app).post(`/api-key/gen/${id}`)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('OK')
    expect(response.body.key).toBeDefined()
  }, 10000) // Timeout of 10 seconds

  // Test for putUpdateById
  it('should update a key by id', async () => {
    // Arrange
    const id = 'someId' // Replace with a valid id
    const updatedKey = { name: 'updatedKey', description: 'This is an updated key', role: 2 }

    // Act
    const response = await request(app).put(`/api-key/${id}`).send(updatedKey)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('OK')
    expect(response.body.key.name).toBe(updatedKey.name)
    expect(response.body.key.description).toBe(updatedKey.description)
    expect(response.body.key.role).toBe(updatedKey.role)
  }, 10000) // Timeout of 10 seconds

  // Test for deleteDeleteById
  it('should delete a key by id', async () => {
    // Arrange
    const id = 'someId' // Replace with a valid id

    // Act
    const response = await request(app).delete(`/api-key/${id}`)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('OK')
  }, 10000) // Timeout of 10 seconds

  afterAll(async () => {
    // Clean up code here
    // Delete the test key from the database
    await KeyModel.deleteOne({ name: 'testKey' })
  })
})
