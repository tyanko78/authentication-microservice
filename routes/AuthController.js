"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var logger_1 = require("../helpers/logger");
var auth_1 = require("../middleware/auth");
var user_1 = require("../models/user");
var _a = process.env, JWT_SECRET_KEY = _a.JWT_SECRET_KEY, JWT_TOKEN_EXPIRE = _a.JWT_TOKEN_EXPIRE, DEFAULT_ADMIN = _a.DEFAULT_ADMIN, DEFAULT_EMAIL = _a.DEFAULT_EMAIL, DEFAULT_PASSWORD = _a.DEFAULT_PASSWORD;
var AuthController = /** @class */ (function () {
    function AuthController() {
        this.path = '/auth';
        this.router = (0, express_1.Router)();
        this.initialiseAccounts();
        this.initialiseRoutes();
    }
    // Create default admin account if no users exist
    AuthController.prototype.initialiseAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasUsers, newUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_1.default.countDocuments({})];
                    case 1:
                        hasUsers = (_a.sent()) > 0;
                        if (hasUsers)
                            return [2 /*return*/];
                        newUser = new user_1.default({
                            name: DEFAULT_ADMIN,
                            username: DEFAULT_ADMIN,
                            email: DEFAULT_EMAIL,
                            password: DEFAULT_PASSWORD,
                        });
                        return [4 /*yield*/, newUser.save()];
                    case 2:
                        _a.sent();
                        (0, logger_1.default)(0, 'Default admin account have been created.');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Initialise routes for the controller
    AuthController.prototype.initialiseRoutes = function () {
        this.router.get(this.path, auth_1.default, this.postAuth.bind(this));
        this.router.post(this.path, auth_1.default, this.postAuth.bind(this));
        this.router.post("".concat(this.path, "/login"), this.postLogin.bind(this));
    };
    // This method handles the POST /auth/login route
    AuthController.prototype.postLogin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, username, password, remember, user, expiresIn, token, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, username = _a.username, password = _a.password, remember = _a.remember;
                        // If username or password is not provided, return a 400 Bad Request response
                        if (!username || !password) {
                            (0, logger_1.default)(1, 'Unable to authenticate user without any credentials.');
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'Unable to authenticate user without any credentials.',
                                })];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, user_1.default.findOne({
                                username: { $regex: new RegExp("^".concat(username, "$"), 'i') },
                            })];
                    case 2:
                        user = _b.sent();
                        // If no user is found or the provided password does not match the user's password, return a 401 Unauthorized response
                        if (!user || !bcrypt_1.default.compareSync(password, user.password)) {
                            (0, logger_1.default)(1, "No user found with username '".concat(username, "'."));
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: 'bad_credentials',
                                })];
                        }
                        // If the user's account status is not 1, return a 401 Unauthorized response
                        if (user.status !== 1) {
                            (0, logger_1.default)(0, "'".concat(user.email, "' authenticated but their account is ").concat(user.status, "."));
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: 'account_locked',
                                })];
                        }
                        expiresIn = remember ? parseInt(JWT_TOKEN_EXPIRE) : 7200;
                        token = jsonwebtoken_1.default.sign({ user: { id: user._id }, remember: remember === 'true' }, JWT_SECRET_KEY, { expiresIn: expiresIn });
                        // Set the AuthToken cookie in the response
                        res.setHeader('Set-Cookie', "AuthToken=".concat(token, "; Path=/;").concat(remember ? " Max-Age=".concat(expiresIn, ";") : ''));
                        (0, logger_1.default)(0, "".concat(user.username, " successfully logged in."));
                        // Return a 200 OK response with the token
                        return [2 /*return*/, res.status(200).json({
                                success: true,
                                message: 'OK',
                                token: token,
                            })];
                    case 3:
                        err_1 = _b.sent();
                        // If an error occurs, log it and return a 500 Internal Server Error response
                        console.log(err_1);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_1,
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // This method handles the POST /auth route
    AuthController.prototype.postAuth = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, body, role;
            return __generator(this, function (_a) {
                user = req.user, body = req.body;
                role = body.role;
                // If a role is provided and the user's role is greater than the provided role
                if (role !== undefined && user.role > role) {
                    // Return a 401 Unauthorized response
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'User permissions are not high enough to access that resource.',
                        })];
                }
                // If the user's role is not greater than the provided role, return a 200 OK response
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: 'Authorised',
                        user: user,
                    })];
            });
        });
    };
    return AuthController;
}());
exports.default = AuthController;
