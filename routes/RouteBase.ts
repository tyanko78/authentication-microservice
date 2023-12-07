import { Router } from 'express'

// Define a base class for routes
export default class RouteBase {
  // Define a property for the path of the route
  public path: string

  // Initialize an instance of the express Router
  public router = Router()

  // Define a constructor that takes a path as an argument
  constructor (path: string) {
    // Assign the path argument to the path property
    this.path = path
  }
}
