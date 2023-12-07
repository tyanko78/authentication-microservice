// helpers
import './config'
import log from './helpers/logger'
import database from './helpers/database'

// routes
import Microservice from './routes/express'
import AuthController from './routes/AuthController'
import UserController from './routes/UserController'
import RoleController from './routes/RoleController'
import APIKeyController from './routes/APIKeyController'
import TenantController from './routes/TenantController'

// enable environment variables
import * as dotenv from 'dotenv'
dotenv.config()

/**
 * Service class
 */
export class Service {
  app: Microservice // Declare the 'app' property
  constructor () {
    this._initialiseDB()
      .then(() => {
        // initialise endpoints
        this.app = new Microservice([
          new AuthController(),
          new RoleController(),
          new UserController(),
          new APIKeyController(),
          new TenantController(),
        ])
      })
      .catch(err => {
        log(2, err)
        process.exit(110)
      })
  }

  /**
   * initialise the database
   */
  async _initialiseDB () {
    const timeout = 20 // number of seconds between each attempt

    const waitingLoop = async (attempt = 0) => {
      if (attempt >= 3) throw new Error(`Connection to database failed after ${attempt} attempts.`)

      try {
        log(0, `Attempting to connect to database.${attempt ? ` This is attempt number ${attempt + 1}.` : ''}`)
        await database()
      } catch (err) {
        log(1, `Connection to database failed. Attempting again in ${timeout} seconds.`)
        log(3, err)
        await new Promise<void>(res => setTimeout(() => res(undefined), timeout * 1000))
        await waitingLoop(attempt + 1)
      }
    }

    await waitingLoop(0)
  }
}

new Service()
