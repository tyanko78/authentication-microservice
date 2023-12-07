"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var bcrypt_1 = require("bcrypt");
var RouteBase_1 = require("./RouteBase");
var logger_1 = require("../helpers/logger");
var auth_1 = require("../middleware/auth");
var missingKeys_1 = require("../helpers/missingKeys");
var user_1 = require("../models/user");
var roles_1 = require("../models/roles");
var tenants_1 = require("../models/tenants");
var _a = process.env, PASSWORD_POLICY = _a.PASSWORD_POLICY, MULTI_TENANCY = _a.MULTI_TENANCY;
var emailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
var pwdRegex = new RegExp(PASSWORD_POLICY);
var UserController = /** @class */ (function (_super) {
    __extends(UserController, _super);
    function UserController() {
        var _this = _super.call(this, '/user') || this;
        _this.initialiseRoutes();
        return _this;
    }
    // Initialize routes for UserController
    UserController.prototype.initialiseRoutes = function () {
        // Route to get all users
        // GET request to '/users' path
        this.router.get(this.path + 's', auth_1.default, this.getUsers);
        // Route to get all users
        // POST request to '/users' path
        this.router.post(this.path + 's', auth_1.default, this.getUsers);
        // Route to create a new user
        // POST request to '/user' path
        this.router.post(this.path, auth_1.default, this.postCreate);
        // Route to get a specific user by ID
        // GET request to '/user/:id' path
        this.router.get(this.path + '/:id', auth_1.default, this.getUsers);
        // Route to update a specific user by ID
        // PUT request to '/user/:id' path
        this.router.put(this.path + '/:id', auth_1.default, this.putUpdateById);
        // Route to delete a specific user by ID
        // DELETE request to '/user/:id' path
        this.router.delete(this.path + '/:id', auth_1.default, this.deleteDeleteById);
    };
    /**
     * This asynchronous function handles the GET users request.
     * It checks if the user is authorized, then retrieves users based on the provided query parameters.
     * It supports pagination, sorting, and searching by various fields.
     * It returns a JSON response with the users data and some metadata like total count.
     */
    UserController.prototype.getUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, _b, sort, _c, limit, include_deleted, _d, page, search, query, roles, count, users, err_1;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        // Check if the user is authorized
                        if (req.user.role > 1) {
                            (0, logger_1.default)(1, "".concat(req.user.username, " is not authorised to get users."));
                            return [2 /*return*/, res.status(401).json({ success: false, message: 'Unable to authenticate user.' })];
                        }
                        id = (req === null || req === void 0 ? void 0 : req.params).id;
                        _a = (req === null || req === void 0 ? void 0 : req.body) || {}, _b = _a.sort, sort = _b === void 0 ? { name: 1 } : _b, _c = _a.limit, limit = _c === void 0 ? 0 : _c, include_deleted = _a.include_deleted, _d = _a.page, page = _d === void 0 ? 0 : _d, search = _a.search;
                        query = id ? { _id: id } : {};
                        // Exclude deleted users if not explicitly included
                        if (!include_deleted && !id)
                            query.status = 1;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, , 7]);
                        if (!(search && !id)) return [3 /*break*/, 3];
                        return [4 /*yield*/, roles_1.default.find({
                                $or: [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }],
                            }).distinct('role_no')];
                    case 2:
                        roles = _f.sent();
                        query['$or'] = [
                            { username: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } },
                            { name: { $regex: search, $options: 'i' } },
                            { role: { $in: roles } },
                        ];
                        _f.label = 3;
                    case 3: return [4 /*yield*/, user_1.default.countDocuments(query)];
                    case 4:
                        count = _f.sent();
                        return [4 /*yield*/, user_1.default.find(query)
                                .sort(sort)
                                .collation({ locale: 'en', numericOrdering: true })
                                .limit(limit)
                                .skip(page * limit)
                                .select({ password: false })
                                .lean()]; // Use lean to improve performance
                    case 5:
                        users = _f.sent() // Use lean to improve performance
                        ;
                        res.status(200).json((_e = {
                                count: count
                            },
                            _e[id ? 'user' : 'users'] = users,
                            _e.success = true,
                            _e.message = 'OK',
                            _e));
                        (0, logger_1.default)(0, "Successfully returning ".concat(users.length, " result").concat(users.length === 1 ? '' : 's'));
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _f.sent();
                        (0, logger_1.default)(1, err_1);
                        return [2 /*return*/, res.status(500).json({ success: false, message: err_1 })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function handles the creation of a new user.
     * It first checks if the user is authorized to create users.
     * Then it validates the input and checks if the user already exists.
     * If everything is valid, it creates the new user and returns a success response.
     */
    UserController.prototype.postCreate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, username, password, additionalFields, name, _b, role, tenant, multiTenancy, error, tenantDocument, tenantDocument_1, newUser, user, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Check if the user is authorized
                        if (req.user.role > 1) {
                            (0, logger_1.default)(1, "".concat(req.user.username, " is not authorised to create users."));
                            return [2 /*return*/, res.status(401).json({ success: false, message: 'Unable to authenticate user.' })];
                        }
                        _a = (req === null || req === void 0 ? void 0 : req.body) || {}, email = _a.email, username = _a.username, password = _a.password, additionalFields = _a.additionalFields, name = _a.name, _b = _a.role, role = _b === void 0 ? req.user.role : _b, tenant = _a.tenant;
                        multiTenancy = MULTI_TENANCY && (MULTI_TENANCY === null || MULTI_TENANCY === void 0 ? void 0 : MULTI_TENANCY.toLocaleLowerCase()) !== 'false';
                        // Check if the user has sufficient permissions
                        if (role < req.user.role) {
                            (0, logger_1.default)(1, 'Unable to create user with greater permissions.');
                            return [2 /*return*/, res.status(403).json({ success: false, message: 'Unable to create user with greater permissions.' })];
                        }
                        error = (0, missingKeys_1.missingKeys)(['username', 'password'], req === null || req === void 0 ? void 0 : req.body);
                        if (error.length) {
                            (0, logger_1.default)(1, "Missing ".concat(error.join(', '), " from body upon user creation request."));
                            return [2 /*return*/, res.status(400).json({ success: false, message: "Missing ".concat(error.join(', '), " from body.") })];
                        }
                        // Validate email format
                        if (email && !emailRegex.test(email)) {
                            (0, logger_1.default)(1, 'Unable to verify email format while creating a user.');
                            return [2 /*return*/, res.status(400).json({ success: false, message: 'Unable to verify email format.' })];
                        }
                        // Check password against policy
                        if (PASSWORD_POLICY && !pwdRegex.test(password)) {
                            (0, logger_1.default)(1, 'Password failed policy check while creating a user.');
                            return [2 /*return*/, res.status(400).json({ success: false, message: 'Password failed policy check.' })];
                        }
                        return [4 /*yield*/, tenants_1.default.findById(tenant).exec()];
                    case 1:
                        tenantDocument = _c.sent();
                        if (multiTenancy && !((tenantDocument === null || tenantDocument === void 0 ? void 0 : tenantDocument.status) === 1)) {
                            return [2 /*return*/, res.status(400).json({ success: false, message: 'Tenancy invalid/required.' })];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, user_1.default.findOne({ username: username })];
                    case 3:
                        // Check if user already exists
                        if (_c.sent()) {
                            (0, logger_1.default)(1, "Unable to create user with the same username '".concat(username, "'."));
                            return [2 /*return*/, res.status(400).json({ success: false, message: 'User already exists.' })];
                        }
                        return [4 /*yield*/, tenants_1.default.findById(tenant).exec()];
                    case 4:
                        tenantDocument_1 = _c.sent();
                        if (multiTenancy && !((tenantDocument_1 === null || tenantDocument_1 === void 0 ? void 0 : tenantDocument_1.status) === 1)) {
                            return [2 /*return*/, res.status(400).json({ success: false, message: 'Tenancy invalid/required.' })];
                        }
                        newUser = new user_1.default({
                            email: email,
                            username: username,
                            name: name,
                            password: String(password),
                            additionalFields: additionalFields,
                            role: role,
                            tenant: tenant,
                        });
                        return [4 /*yield*/, newUser.save()];
                    case 5:
                        _c.sent();
                        (0, logger_1.default)(0, 'Successfully created a new user.');
                        user = newUser.toObject();
                        delete user.password;
                        // Return the response
                        res.status(200).json({ user: user, success: true, message: 'Successfully created a new user.' });
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _c.sent();
                        (0, logger_1.default)(1, err_2);
                        return [2 /*return*/, res.status(500).json({ success: false, message: err_2 })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This asynchronous function handles the PUT request to update a user by ID.
     * It first checks if the user is authorized to update the user.
     * Then it validates the input and checks if the user exists.
     * If everything is valid, it updates the user and returns a success response.
     */
    UserController.prototype.putUpdateById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, isUser, isAdmin, _a, username, email, password, current_password, name_1, role, additionalFields, status_1, user, _af_1, _b, _c, err_3;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        id = ((req === null || req === void 0 ? void 0 : req.params) || {}).id;
                        isUser = String(req.user._id) === id;
                        isAdmin = req.user.role <= 1;
                        // Did the user pass a cookie?
                        if (!isUser && !isAdmin) {
                            (0, logger_1.default)(1, "Account does not have permissions to edit this user.");
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: 'You do not have permissions to edit this user.',
                                })];
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        _a = (req === null || req === void 0 ? void 0 : req.body) || {}, username = _a.username, email = _a.email, password = _a.password, current_password = _a.current_password, name_1 = _a.name, role = _a.role, additionalFields = _a.additionalFields, status_1 = _a.status;
                        // Check if any fields to be updated were provided
                        if (!username &&
                            !email &&
                            !password &&
                            !name_1 &&
                            typeof role === 'undefined' &&
                            typeof status_1 === 'undefined' &&
                            !additionalFields) {
                            return [2 /*return*/, res.status(400).json({
                                    success: true,
                                    message: 'No update requested.',
                                })];
                        }
                        return [4 /*yield*/, user_1.default.findById(String(id))
                            // Check if the user exists
                        ];
                    case 2:
                        user = _e.sent();
                        // Check if the user exists
                        if (!user) {
                            (0, logger_1.default)(1, "Unable to find user with ID '".concat(String(id), "' in order to update their account."));
                            res.status(400).json({
                                success: false,
                                message: "Unable to find user with ID '".concat(String(id), "'."),
                            });
                            return [2 /*return*/];
                        }
                        // Check if the user has sufficient permissions to update the user
                        if (user.role < req.user.role) {
                            (0, logger_1.default)(1, 'Unable to modify user with greater permissions.');
                            return [2 /*return*/, res.status(403).json({
                                    success: false,
                                    message: "Unable to modify user with greater permissions.",
                                })];
                        }
                        // If the user has updated their password, check if the current password was provided and if it's correct
                        if (password) {
                            // Have they supplied their current password?
                            if (!isAdmin && !current_password) {
                                (0, logger_1.default)(1, "User tried to update their password without supplying their current password (current_password) - '".concat(String(id), "'"));
                                res.status(400).json({
                                    success: false,
                                    message: 'Please provide your current password in order to update it.',
                                });
                                return [2 /*return*/];
                            }
                            if (current_password && !bcrypt_1.default.compareSync(current_password, user.password)) {
                                (0, logger_1.default)(1, "Unable to update password for '".concat(String(id), "' as they have provided the incorrect current password."));
                                res.status(400).json({
                                    success: false,
                                    message: "Unable to update password as your current password is incorrect.",
                                });
                                return [2 /*return*/];
                            }
                        }
                        // Validate the email using a regular expression
                        if (email && !emailRegex.test(email)) {
                            (0, logger_1.default)(2, 'Unable to update user with invalid email.');
                            // Return a response with a status of 400 and a message indicating the email is invalid
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'Unable to update user with invalid email.',
                                })];
                        }
                        // Check if a password policy is enforced, and if so, validate the password
                        if (PASSWORD_POLICY && password && !pwdRegex.test(password)) {
                            (0, logger_1.default)(2, 'Unable to update user with failing password.');
                            // Return a response with a status of 400 and a message indicating the password is invalid
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'Unable to update user with failing password.',
                                })];
                        }
                        // Update the user's fields if they are provided
                        if (username)
                            user.username = username;
                        if (email)
                            user.email = email;
                        if (password)
                            user.password = password;
                        if (name_1)
                            user.name = name_1;
                        if (isAdmin && !isUser && role)
                            user.role = role;
                        if (isAdmin && !isUser && status_1)
                            user.status = status_1;
                        // If the user is an admin and not the user being updated, and additional fields are provided, update them
                        if (isAdmin && !isUser && additionalFields) {
                            _af_1 = __assign(__assign({}, user.additionalFields), additionalFields);
                            // Remove any fields that are set to null
                            user.additionalFields = Object.keys(_af_1).reduce(function (obj, key) {
                                if (Boolean(_af_1[key] !== null))
                                    obj[key] = _af_1[key];
                                return obj;
                            }, {});
                        }
                        // Save the updated user to the database
                        return [4 /*yield*/, user.save()
                            // Log a info message.
                        ];
                    case 3:
                        // Save the updated user to the database
                        _e.sent();
                        // Log a info message.
                        (0, logger_1.default)(0, "Successfully updated user data for '".concat(user.username, "' with ID '").concat(String(id), "'."));
                        // Return the response.
                        _c = (_b = res.status(200)).json;
                        _d = {};
                        return [4 /*yield*/, user_1.default.findById(String(id)).select({
                                _id: false,
                                password: false,
                            })];
                    case 4:
                        // Return the response.
                        _c.apply(_b, [(_d.user = (_e.sent()).toObject(),
                                _d.success = true,
                                _d.message = 'OK',
                                _d)]);
                        return [2 /*return*/];
                    case 5:
                        err_3 = _e.sent();
                        (0, logger_1.default)(1, err_3);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_3,
                            })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This asynchronous function handles the DELETE user request by ID.
     * It first checks if the user is authenticated and has the necessary permissions.
     * Then it retrieves the user from the database and checks if the user exists and if the user has greater permissions.
     * If the user is already marked for deletion, it returns a message indicating that.
     * If the request body contains a 'hard_delete' field, it deletes the user permanently, otherwise it marks the user for deletion.
     * It returns a JSON response with the user data (if not hard deleted), a success status, and a message.
     * It also logs an info message indicating the user has been successfully deleted.
     */
    UserController.prototype.deleteDeleteById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check if the user has the necessary permissions
                        if (req.user.role > 1) {
                            (0, logger_1.default)(1, 'Unable to authenticate user while deleting account.');
                            // Return a response with a status of 401 and a message indicating the user is not authenticated
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: 'Unable to authenticate user.',
                                })];
                        }
                        id = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, user_1.default.findById(id).select({
                                password: false,
                            })
                            // If the user does not exist, return a response with a status of 400 and a message indicating the user does not exist
                        ];
                    case 2:
                        user = _a.sent();
                        // If the user does not exist, return a response with a status of 400 and a message indicating the user does not exist
                        if (!user) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'User does not exist.',
                                })];
                        }
                        // If the user has greater permissions, return a response with a status of 403 and a message indicating the user has greater permissions
                        if (user.role < req.user.role) {
                            (0, logger_1.default)(1, 'Unable to modify user with greater permissions.');
                            return [2 /*return*/, res.status(403).json({
                                    success: false,
                                    message: 'Unable to modify user with greater permissions.',
                                })];
                        }
                        // If the user is already marked for deletion and the request does not contain a 'hard_delete' field, return a response with a status of 200 and a message indicating the user is already marked for deletion
                        if (user.deleted_at !== null && !req.body.hard_delete) {
                            return [2 /*return*/, res.status(200).json({
                                    success: false,
                                    message: 'User is already marked for deletion',
                                })];
                        }
                        if (!req.body.hard_delete) return [3 /*break*/, 4];
                        return [4 /*yield*/, user_1.default.deleteOne({ _id: id })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, user_1.default.findByIdAndUpdate(id, {
                            status: 0,
                            deleted_at: Date.now(),
                        })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        // Return a response with a status of 200, the user data (if not hard deleted), a success status, and a message
                        res.status(200).json({
                            user: req.body.hard_delete ? null : user.toObject(),
                            success: true,
                            message: 'OK',
                        });
                        // Log an info message indicating the user has been successfully deleted
                        (0, logger_1.default)(0, "Successfully deleted (".concat(req.body.hard_delete ? 'hard' : 'soft', ") user '").concat(user.username, "' with ID '").concat(id, "'."));
                        return [2 /*return*/];
                    case 7:
                        err_4 = _a.sent();
                        // Log the error and return a response with a status of 500 and a message containing the error
                        (0, logger_1.default)(1, err_4);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_4,
                            })];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return UserController;
}(RouteBase_1.default));
exports.default = UserController;
