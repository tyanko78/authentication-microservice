import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import log from '../helpers/logger';
import auth from '../middleware/auth';
import UserModel from '../models/user';

const { JWT_SECRET_KEY, JWT_TOKEN_EXPIRE, DEFAULT_ADMIN, DEFAULT_EMAIL, DEFAULT_PASSWORD } = process.env;

// Define interfaces for User and Body
interface User {
	_id: string;
	role: number;
	status: number;
	email: string;
	username: string;
	password: string;
}

interface Body {
	username?: string;
	password?: string;
	remember?: string;
	role?: number;
}

// Extend Request to include User and Body
interface RequestWithUser extends Request {
	user: User;
	body: Body;
}

class AuthController {
	public path = '/auth';
	public router = Router();

	constructor() {
		this.initialiseAccounts();
		this.initialiseRoutes();
	}

	// Create default admin account if no users exist
	private async initialiseAccounts() {
		const hasUsers = (await UserModel.countDocuments({})) > 0;

		if (hasUsers) return;

		const newUser = new UserModel({
			name: DEFAULT_ADMIN,
			username: DEFAULT_ADMIN,
			email: DEFAULT_EMAIL,
			password: DEFAULT_PASSWORD,
		});

		await newUser.save();

		log(0, 'Default admin account have been created.');
	}

	// Initialise routes for the controller
	private initialiseRoutes() {
		this.router.get(this.path, auth, this.postAuth.bind(this));
		this.router.post(this.path, auth, this.postAuth.bind(this));
		this.router.post(`${this.path}/login`, this.postLogin.bind(this));
	}


	// This method handles the POST /auth/login route
	private async postLogin(req: RequestWithUser, res: Response) {
		// Destructure username, password, and remember from the request body
		const { username, password, remember } = req.body;

		// If username or password is not provided, return a 400 Bad Request response
		if (!username || !password) {
			log(1, 'Unable to authenticate user without any credentials.');

			return res.status(400).json({
				success: false,
				message: 'Unable to authenticate user without any credentials.',
			});
		}

		try {
			// Try to find a user with the provided username
			const user = await UserModel.findOne({
				username: { $regex: new RegExp(`^${username}$`, 'i') },
			});

			// If no user is found or the provided password does not match the user's password, return a 401 Unauthorized response
			if (!user || !bcrypt.compareSync(password, user.password)) {
				log(1, `No user found with username '${username}'.`);

				return res.status(401).json({
					success: false,
					message: 'bad_credentials',
				});
			}

			// If the user's account status is not 1, return a 401 Unauthorized response
			if (user.status !== 1) {
				log(0, `'${user.email}' authenticated but their account is ${user.status}.`);

				return res.status(401).json({
					success: false,
					message: 'account_locked',
				});
			}


			// Determine the token expiration time based on whether the user chose to be remembered
			const expiresIn = remember ? parseInt(JWT_TOKEN_EXPIRE) : 7200;
			// Sign a new JWT for the user
			const token = jwt.sign({ user: { id: user._id }, remember: remember === 'true' }, JWT_SECRET_KEY, { expiresIn });

			// Set the AuthToken cookie in the response
			res.setHeader('Set-Cookie', `AuthToken=${token}; Path=/;${remember ? ` Max-Age=${expiresIn};` : ''}`);

			log(0, `${user.username} successfully logged in.`);

			// Return a 200 OK response with the token
			return res.status(200).json({
				success: true,
				message: 'OK',
				token,
			});
		} catch (err) {
			// If an error occurs, log it and return a 500 Internal Server Error response
			console.log(err);

			return res.status(500).json({
				success: false,
				message: err,
			});
		}
	}

	// This method handles the POST /auth route
	private async postAuth(req: RequestWithUser, res: Response) {
		// Destructure user and body from the request
		const { user, body } = req;
		// Destructure role from the body
		const { role } = body;

		// If a role is provided and the user's role is greater than the provided role
		if (role !== undefined && user.role > role) {
			// Return a 401 Unauthorized response
			return res.status(401).json({
				success: false,
				message: 'User permissions are not high enough to access that resource.',
			});
		}

		// If the user's role is not greater than the provided role, return a 200 OK response
		return res.status(200).json({
			success: true,
			message: 'Authorised',
			user,
		});
	}
}

export default AuthController;