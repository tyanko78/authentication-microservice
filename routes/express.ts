import express, { Request, Response } from 'express'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import log from '../helpers/logger'

// Extract necessary environment variables
const { MICROSERVICE_NAME, EXTERNAL_PORT, INTERNAL_PORT, BASE_HOST, npm_package_version } = process.env

// Define a class for the microservice
class Microservice {
  // Initialize an instance of the express app
  private app = express()
  // Declare a server variable
  private server: any

  // Define a constructor that takes an array of controllers as an argument
  constructor (controllers: any[]) {
    // Use the json middleware to parse JSON request bodies
    this.app.use(json())
    // Use the urlencoded middleware to parse URL-encoded request bodies
    this.app.use(urlencoded({ extended: true }))
    // Use the cors middleware to enable CORS
    this.app.use(
      cors({
        credentials: true,
        origin: (origin: any, callback: any) => {
          // If there is no origin, call the callback function with false as the second argument
          if (!origin) return callback(null, false)
          // Extract the hostname from the origin
          const { hostname } = new URL(origin)
          // Define an array of allowed origins
          const allowedOrigins = [...BASE_HOST.split(','), 'localhost']
          // Call the callback function with true as the second argument if the hostname is in the array of allowed origins
          callback(null, allowedOrigins.includes(hostname))
        },
      }),
    )

    // Set up a route that matches all HTTP methods and paths and calls the allDefaultMessage method
    this.app.all('/', this.allDefaultMessage)

    // For each controller in the array of controllers, use its router with the express app
    controllers.forEach(controller => this.app.use('/', controller.router))

    // Start the server on the internal port and log a message
    this.server = this.app.listen(INTERNAL_PORT, () => {
      log(0, `Microservice (${MICROSERVICE_NAME} - v${npm_package_version}) started. ${INTERNAL_PORT}:${EXTERNAL_PORT}`)
    })
  }

  // Define a method that returns a default message
  private allDefaultMessage (req: Request, res: Response) {
    // Log a message
    log(0, 'Returning default message.')

    // Return a response with a status of 200 and a JSON body
    return res.status(200).json({
      name: `${MICROSERVICE_NAME} Microservice`,
      version: npm_package_version,
      success: true,
      message: `This microservice is running as expected.`,
    })
  }
}

export default Microservice
