import mongoose, { ConnectOptions } from 'mongoose'
import * as dotenv from 'dotenv'
import log from './logger'

// Load environment variables from .env file
dotenv.config()

// Extract MongoDB credentials and connection string from environment variables
const { MONGODB_USER, MONGODB_PASSWORD, DATABASE_CONNECTION } = process.env

// Determine if MongoDB authentication should be used
const useAuth = Boolean(MONGODB_USER && MONGODB_PASSWORD)

// Construct MongoDB connection URI
const mongoUri = `mongodb://${useAuth ? `${MONGODB_USER}:${MONGODB_PASSWORD}@` : ''}${DATABASE_CONNECTION}`

// Define an async function to connect to the MongoDB database
export default async function connectToDatabase (): Promise<void> {
  // If MongoDB authentication is not used, log a warning message
  if (!useAuth) {
    log(1, 'Mongodb connection is missing login credentials, this is insecure. Continuing...')
  }

  try {
    // Define MongoDB connection options
    const options: ConnectOptions = {}
    // Attempt to connect to the MongoDB database
    await mongoose.connect(mongoUri, options)
    // Log a success message if the connection is successful
    console.log('Database connected successfully')
  } catch (error) {
    // Log an error message if the connection fails
    console.error('Database connection failed:', error)
  }
}
